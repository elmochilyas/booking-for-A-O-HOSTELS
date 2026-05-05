<?php

namespace App\Http\Controllers\Api;

use App\Actions\Bookings\CancelBooking;
use App\Actions\Bookings\CheckBookingAvailability;
use App\Actions\Bookings\CheckInBooking;
use App\Actions\Bookings\CheckOutBooking;
use App\Actions\Bookings\CreateBooking;
use App\Actions\Bookings\GetBooking;
use App\Actions\Bookings\GetBookings;
use App\Actions\Bookings\UpdateBooking;
use App\DTO\CreateBookingDTO;
use App\DTO\UpdateBookingDTO;
use App\Exceptions\RoomNotAvailableException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Booking\CheckAvailabilityRequest;
use App\Http\Requests\Api\Booking\CreateBookingRequest;
use App\Http\Requests\Api\Booking\ListBookingsRequest;
use App\Http\Requests\Api\Booking\UpdateBookingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Authorize;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('auth.jwt')]
class BookingController extends Controller
{
    public function __construct(
        private GetBookings $getBookings,
        private GetBooking $getBooking,
        private CheckBookingAvailability $checkBookingAvailability,
        private CreateBooking $createBooking,
        private UpdateBooking $updateBooking,
        private CancelBooking $cancelBooking,
        private CheckInBooking $checkInBooking,
        private CheckOutBooking $checkOutBooking,
    ) {}

    public function index(ListBookingsRequest $request): JsonResponse
    {
        $bookings = $this->getBookings->handle(
            $request->validated(),
            $request->validated('per_page', 15)
        );

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    #[Authorize('view', 'booking')]
    public function show(string $id): JsonResponse
    {
        $booking = $this->getBooking->handle($id);

        return response()->json([
            'booking' => $booking,
        ]);
    }

    public function store(CreateBookingRequest $request): JsonResponse
    {
        try {
            $dto = CreateBookingDTO::fromRequest($request);
            $booking = $this->createBooking->handle($dto);

            return response()->json([
                'message' => 'Booking created successfully',
                'booking' => $booking,
                'requires_payment' => true,
            ], 201);
        } catch (RoomNotAvailableException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'available_alternatives' => $this->checkBookingAvailability->handle(
                    $dto->propertyId,
                    $dto->checkInDate->toDateString(),
                    $dto->checkOutDate->toDateString()
                ),
            ], 400);
        }
    }

    #[Authorize('update', 'booking')]
    public function update(UpdateBookingRequest $request, string $id): JsonResponse
    {
        $booking = $this->getBooking->handle($id);
        $dto = UpdateBookingDTO::fromRequest($request);
        $updatedBooking = $this->updateBooking->handle($booking, $dto);

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $updatedBooking,
        ]);
    }

    #[Authorize('cancel', 'booking')]
    public function cancel(string $id): JsonResponse
    {
        $booking = $this->getBooking->handle($id);
        $updatedBooking = $this->cancelBooking->handle(
            $booking,
            request()->input('reason', 'No reason provided')
        );

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'refund_amount' => $updatedBooking->refund_amount,
            'refund_processing_days' => '3-5',
        ]);
    }

    #[Authorize('checkIn', 'booking')]
    public function checkIn(string $id): JsonResponse
    {
        $booking = $this->getBooking->handle($id);
        $updatedBooking = $this->checkInBooking->handle(
            $booking,
            request()->input('notes')
        );

        return response()->json([
            'message' => 'Check-in successful',
            'booking' => $updatedBooking,
        ]);
    }

    #[Authorize('checkOut', 'booking')]
    public function checkOut(string $id): JsonResponse
    {
        $booking = $this->getBooking->handle($id);
        $updatedBooking = $this->checkOutBooking->handle($booking);

        return response()->json([
            'message' => 'Check-out successful',
            'booking' => $updatedBooking,
        ]);
    }

    public function availability(CheckAvailabilityRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $roomTypes = $this->checkBookingAvailability->handle(
            $validated['property_id'],
            $validated['check_in'],
            $validated['check_out']
        );

        return response()->json(['data' => $roomTypes]);
    }
}
