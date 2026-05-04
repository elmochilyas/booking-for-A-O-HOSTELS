<?php

namespace App\Modules\Bookings\Services;

use App\Models\Booking;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BookingService
{
    private AvailabilityService $availabilityService;

    public function __construct(AvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    public function createBooking(Request $request): array
    {
        $validator = Validator::make($request->all(), [
            'guest_id' => 'required|uuid|exists:guests,id',
            'property_id' => 'required|uuid|exists:properties,id',
            'room_type_id' => 'required|uuid|exists:room_types,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'guest_count' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return ['success' => false, 'errors' => $validator->errors()];
        }

        $checkIn = $request->check_in_date;
        $checkOut = $request->check_out_date;
        $roomTypeId = $request->room_type_id;

        $roomType = RoomType::find($roomTypeId);
        if (! $roomType || $roomType->capacity < $request->guest_count) {
            return ['success' => false, 'message' => 'Room capacity exceeded'];
        }

        $bookedRoomIds = $this->availabilityService->getBookedRoomIds($roomTypeId, $checkIn, $checkOut);

        $availableRoom = Room::where('room_type_id', $roomTypeId)
            ->whereNotIn('id', $bookedRoomIds)
            ->where('status', 'available')
            ->first();

        if (! $availableRoom) {
            return ['success' => false, 'message' => 'No rooms available for selected dates'];
        }

        try {
            DB::beginTransaction();

            $nights = (new \DateTime($checkIn))->diff(new \DateTime($checkOut))->days;
            $totalPrice = $roomType->base_price * $nights;

            $booking = Booking::create([
                'guest_id' => $request->guest_id,
                'property_id' => $request->property_id,
                'room_type_id' => $roomTypeId,
                'room_id' => $availableRoom->id,
                'check_in_date' => $checkIn,
                'check_out_date' => $checkOut,
                'guest_count' => $request->guest_count,
                'total_price' => $totalPrice,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            $availableRoom->update(['status' => 'booked']);

            DB::commit();

            return [
                'success' => true,
                'data' => $booking,
                'message' => 'Booking created successfully',
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return ['success' => false, 'message' => 'Failed to create booking: '.$e->getMessage()];
        }
    }

    public function confirmBooking(string $bookingId): array
    {
        $booking = Booking::find($bookingId);

        if (! $booking) {
            return ['success' => false, 'message' => 'Booking not found'];
        }

        if ($booking->status !== 'pending') {
            return ['success' => false, 'message' => 'Booking cannot be confirmed'];
        }

        $booking->update(['status' => 'confirmed']);

        return ['success' => true, 'data' => $booking, 'message' => 'Booking confirmed'];
    }

    public function cancelBooking(string $bookingId): array
    {
        $booking = Booking::find($bookingId);

        if (! $booking) {
            return ['success' => false, 'message' => 'Booking not found'];
        }

        if ($booking->status === 'cancelled') {
            return ['success' => false, 'message' => 'Booking already cancelled'];
        }

        try {
            DB::beginTransaction();

            $booking->update(['status' => 'cancelled']);

            if ($booking->room_id) {
                Room::where('id', $booking->room_id)->update(['status' => 'available']);
            }

            DB::commit();

            return ['success' => true, 'message' => 'Booking cancelled successfully'];
        } catch (\Exception $e) {
            DB::rollBack();

            return ['success' => false, 'message' => 'Failed to cancel booking'];
        }
    }

    public function getBooking(string $bookingId): ?Booking
    {
        return Booking::with(['property', 'roomType', 'room', 'guest', 'payments'])->find($bookingId);
    }

    public function getGuestBookings(string $guestId): array
    {
        return Booking::where('guest_id', $guestId)
            ->with(['property', 'roomType'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function checkIn(string $bookingId, ?string $roomId = null): array
    {
        $booking = Booking::find($bookingId);

        if (! $booking) {
            return ['success' => false, 'message' => 'Booking not found'];
        }

        if ($booking->status !== 'confirmed') {
            return ['success' => false, 'message' => 'Only confirmed bookings can be checked in'];
        }

        if ($roomId) {
            $booking->update(['room_id' => $roomId]);
        }

        $booking->update([
            'status' => 'checked_in',
            'actual_check_in' => now(),
        ]);

        return ['success' => true, 'data' => $booking, 'message' => 'Check-in successful'];
    }

    public function checkOut(string $bookingId): array
    {
        $booking = Booking::find($bookingId);

        if (! $booking) {
            return ['success' => false, 'message' => 'Booking not found'];
        }

        if ($booking->status !== 'checked_in') {
            return ['success' => false, 'message' => 'Booking must be checked in first'];
        }

        $booking->update([
            'status' => 'completed',
            'actual_check_out' => now(),
        ]);

        if ($booking->room_id) {
            Room::where('id', $booking->room_id)->update(['status' => 'available']);
        }

        return ['success' => true, 'data' => $booking, 'message' => 'Check-out successful'];
    }
}
