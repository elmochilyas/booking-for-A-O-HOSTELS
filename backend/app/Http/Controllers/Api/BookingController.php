<?php

namespace App\Http\Controllers\Api;

use App\Actions\Bookings\CancelBooking;
use App\Actions\Bookings\CheckInBooking;
use App\Actions\Bookings\CheckOutBooking;
use App\Actions\Bookings\CreateBooking;
use App\Actions\Bookings\UpdateBooking;
use App\Contracts\Repositories\BookingRepositoryInterface;
use App\DTO\CreateBookingDTO;
use App\DTO\UpdateBookingDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Booking\CheckAvailabilityRequest;
use App\Http\Requests\Api\Booking\CreateBookingRequest;
use App\Http\Requests\Api\Booking\UpdateBookingRequest;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function index(): JsonResponse
    {
        $bookings = $this->bookings->getPaginated(request()->all());

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $booking = $this->bookings->findOrFail($id);

        return response()->json([
            'booking' => $booking,
        ]);
    }

    public function store(CreateBookingRequest $request, CreateBooking $action): JsonResponse
    {
        try {
            $dto = CreateBookingDTO::fromRequest($request);
            $booking = $action->handle($dto);

            return response()->json([
                'message' => 'Booking created successfully',
                'booking' => $booking,
                'requires_payment' => true,
            ], 201);
        } catch (\App\Exceptions\RoomNotAvailableException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'available_alternatives' => $this->bookings->getAvailableRooms(
                    $dto->propertyId,
                    $dto->checkInDate->toDateString(),
                    $dto->checkOutDate->toDateString()
                ),
            ], 400);
        }
    }

    public function update(UpdateBookingRequest $request, string $id, UpdateBooking $action): JsonResponse
    {
        $booking = $this->bookings->findOrFail($id);
        $dto = UpdateBookingDTO::fromRequest($request);
        $updatedBooking = $action->handle($booking, $dto);

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $updatedBooking,
        ]);
    }

    public function cancel(string $id, CancelBooking $action): JsonResponse
    {
        $request = request();
        $booking = $this->bookings->findOrFail($id);
        $updatedBooking = $action->handle($booking, $request->input('reason', 'No reason provided'));

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'refund_amount' => $updatedBooking->refund_amount,
            'refund_processing_days' => '3-5',
        ]);
    }

    public function checkIn(string $id, CheckInBooking $action): JsonResponse
    {
        $request = request();
        $booking = $this->bookings->findOrFail($id);
        $updatedBooking = $action->handle($booking, $request->input('notes'));

        return response()->json([
            'message' => 'Check-in successful',
            'booking' => $updatedBooking,
        ]);
    }

    public function checkOut(string $id, CheckOutBooking $action): JsonResponse
    {
        $booking = $this->bookings->findOrFail($id);
        $updatedBooking = $action->handle($booking);

        return response()->json([
            'message' => 'Check-out successful',
            'booking' => $updatedBooking,
        ]);
    }

    public function availability(CheckAvailabilityRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $roomTypes = $this->bookings->getAvailableRooms(
            $validated['property_id'],
            $validated['check_in'],
            $validated['check_out']
        );

        return response()->json(['data' => $roomTypes]);
    }
}
