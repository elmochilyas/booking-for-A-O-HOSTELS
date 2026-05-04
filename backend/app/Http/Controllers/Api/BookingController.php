<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Extra;
use App\Models\Room;
use App\Models\RoomType;
use App\Services\EmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function __construct(
        private EmailService $emailService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['property', 'roomType', 'guest']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->where('check_in_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->where('check_out_date', '<=', $request->date_to);
        }

        $bookings = $query->orderBy('check_in_date')->get();

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $booking = Booking::with(['property', 'roomType', 'guest', 'payments', 'extras'])->find($id);

        if (! $booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json([
            'booking' => $booking,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            'room_type_id' => 'required|uuid|exists:room_types,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'guest_count' => 'required|integer|min:1',
            'special_requests' => 'nullable|string|max:500',
            'extras' => 'nullable|array',
            'extras.*.id' => 'uuid|exists:extras,id',
            'extras.*.quantity' => 'integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $guestId = $user->id;

        $data = $validator->validated();
        $data['id'] = Str::uuid()->toString();
        $data['guest_id'] = $guestId;

        $conflict = $this->checkAvailability(
            $data['property_id'],
            $data['room_type_id'],
            $data['check_in_date'],
            $data['check_out_date']
        );

        if ($conflict) {
            return response()->json([
                'error' => 'Selected room type is not available for the chosen dates',
                'available_alternatives' => $this->getAvailableAlternatives(
                    $data['property_id'],
                    $data['check_in_date'],
                    $data['check_out_date'],
                    $data['guest_count']
                ),
            ], 409);
        }

        DB::beginTransaction();
        try {
            $room = $this->findAvailableRoom(
                $data['property_id'],
                $data['room_type_id'],
                $data['check_in_date'],
                $data['check_out_date']
            );

            $roomId = $room ? $room->id : null;
            $totalPrice = $this->calculateTotalPrice(
                $data['property_id'],
                $data['room_type_id'],
                $data['check_in_date'],
                $data['check_out_date'],
                $data['extras'] ?? []
            );

            $data['room_id'] = $roomId;
            $data['total_price'] = $totalPrice;
            $data['status'] = 'pending';
            $data['payment_status'] = 'pending';

            $booking = Booking::create($data);

            if ($room) {
                $room->update(['status' => 'booked']);
            }

            DB::commit();

            $booking->load(['property', 'roomType', 'guest']);
            $this->emailService->sendBookingConfirmation($booking);

            return response()->json([
                'message' => 'Booking created successfully',
                'booking' => $booking,
                'requires_payment' => true,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to create booking: '.$e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $booking = Booking::find($id);

        if (! $booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        if (! in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json(['error' => 'Cannot modify this booking'], 400);
        }

        $validator = Validator::make($request->all(), [
            'check_in_date' => 'sometimes|date',
            'check_out_date' => 'sometimes|date|after:check_in_date',
            'guest_count' => 'sometimes|integer|min:1',
            'special_requests' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (isset($data['check_in_date']) || isset($data['check_out_date'])) {
            $checkIn = $data['check_in_date'] ?? $booking->check_in_date;
            $checkOut = $data['check_out_date'] ?? $booking->check_out_date;

            $conflict = $this->checkAvailability(
                $booking->property_id,
                $booking->room_type_id,
                $checkIn,
                $checkOut,
                $id
            );

            if ($conflict) {
                return response()->json(['error' => 'New dates are not available'], 409);
            }

            $data['total_price'] = $this->calculateTotalPrice(
                $booking->property_id,
                $booking->room_type_id,
                $checkIn,
                $checkOut,
                []
            );
        }

        $booking->update($data);
        $booking->load(['property', 'roomType', 'guest']);

        $this->emailService->sendBookingModification($booking);

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking,
        ]);
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $booking = Booking::find($id);

        if (! $booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->status === 'cancelled') {
            return response()->json(['error' => 'Booking already cancelled'], 400);
        }

        $refundAmount = $this->calculateRefund($booking);

        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->reason ?? null,
            'refund_amount' => $refundAmount,
        ]);

        if ($booking->room_id) {
            Room::where('id', $booking->room_id)->update(['status' => 'available']);
        }

        $this->emailService->sendCancellationConfirmation($booking, $refundAmount);

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'refund_amount' => $refundAmount,
            'refund_processing_days' => '3-5',
        ]);
    }

    public function checkIn(Request $request, string $id): JsonResponse
    {
        $booking = Booking::find($id);

        if (! $booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->status !== 'confirmed') {
            return response()->json(['error' => 'Booking must be confirmed to check in'], 400);
        }

        if ($booking->payment_status === 'pending') {
            return response()->json(['error' => 'Outstanding balance must be paid first'], 400);
        }

        $booking->update([
            'status' => 'checked_in',
            'actual_check_in' => now(),
        ]);

        if ($booking->room_id) {
            Room::where('id', $booking->room_id)->update(['status' => 'occupied']);
        }

        $this->emailService->sendCheckInConfirmation($booking);

        return response()->json([
            'message' => 'Check-in successful',
            'booking' => $booking,
        ]);
    }

    public function checkOut(Request $request, string $id): JsonResponse
    {
        $booking = Booking::find($id);

        if (! $booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->status !== 'checked_in') {
            return response()->json(['error' => 'Guest must be checked in first'], 400);
        }

        $booking->update([
            'status' => 'completed',
            'actual_check_out' => now(),
        ]);

        if ($booking->room_id) {
            Room::where('id', $booking->room_id)->update(['status' => 'cleaning']);
        }

        $this->emailService->sendCheckOutThankYou($booking);

        return response()->json([
            'message' => 'Check-out successful',
            'booking' => $booking,
        ]);
    }

    private function checkAvailability(string $propertyId, string $roomTypeId, string $checkIn, string $checkOut, ?string $excludeBookingId = null): bool
    {
        $query = Booking::where('property_id', $propertyId)
            ->where('room_type_id', $roomTypeId)
            ->whereIn('status', ['confirmed', 'pending', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            });

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        return $query->exists();
    }

    private function findAvailableRoom(string $propertyId, string $roomTypeId, string $checkIn, string $checkOut): ?Room
    {
        $bookedRoomIds = Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'pending', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->whereNotNull('room_id')
            ->pluck('room_id')
            ->toArray();

        return Room::where('property_id', $propertyId)
            ->where('room_type_id', $roomTypeId)
            ->where('status', 'available')
            ->whereNotIn('id', $bookedRoomIds)
            ->first();
    }

    private function getAvailableAlternatives(string $propertyId, string $checkIn, string $checkOut, int $guests): array
    {
        $roomTypes = RoomType::where('property_id', $propertyId)
            ->where('capacity', '>=', $guests)
            ->get();

        $alternatives = [];
        foreach ($roomTypes as $roomType) {
            if (! $this->checkAvailability($propertyId, $roomType->id, $checkIn, $checkOut)) {
                $alternatives[] = [
                    'id' => $roomType->id,
                    'name' => $roomType->name,
                    'capacity' => $roomType->capacity,
                    'price' => $this->calculatePrice($roomType->base_price, $checkIn, $checkOut),
                ];
            }
        }

        return $alternatives;
    }

    private function calculateTotalPrice(string $propertyId, string $roomTypeId, string $checkIn, string $checkOut, array $extras): float
    {
        $roomType = RoomType::find($roomTypeId);
        $basePrice = $this->calculatePrice($roomType->base_price ?? 0, $checkIn, $checkOut);

        $extrasPrice = 0;
        foreach ($extras as $extra) {
            $extraModel = Extra::find($extra['id']);
            if ($extraModel) {
                $extrasPrice += $extraModel->price * ($extra['quantity'] ?? 1);
            }
        }

        return $basePrice + $extrasPrice;
    }

    private function calculatePrice(float $basePrice, string $checkIn, string $checkOut): float
    {
        $nights = max(1, (strtotime($checkOut) - strtotime($checkIn)) / (60 * 60 * 24));

        return $basePrice * $nights;
    }

    private function calculateRefund(Booking $booking): float
    {
        $nightsUntilCheckIn = (strtotime($booking->check_in_date) - time()) / (60 * 60 * 24);

        if ($nightsUntilCheckIn >= 14) {
            return $booking->total_price;
        } elseif ($nightsUntilCheckIn >= 7) {
            return $booking->total_price * 0.5;
        }

        return 0;
    }
}
