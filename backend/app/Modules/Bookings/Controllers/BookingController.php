<?php

declare(strict_types=1);

namespace App\Modules\Bookings\Controllers;

use App\Actions\Bookings\CancelBooking;
use App\Actions\Bookings\CheckInBooking;
use App\Actions\Bookings\CheckOutBooking;
use App\Actions\Bookings\CreateBooking;
use App\Actions\Bookings\GetBooking;
use App\Actions\Bookings\GetBookings;
use App\Actions\Bookings\UpdateBooking;
use App\Contracts\Repositories\BookingRepositoryInterface;
use App\DTO\CreateBookingDTO;
use App\DTO\UpdateBookingDTO;
use App\Enums\BookingStatus;
use App\Http\Requests\Api\Booking\CreateBookingRequest;
use App\Http\Requests\Modules\Bookings\CancelBookingRequest;
use App\Http\Requests\Modules\Bookings\CheckInRequest;
use App\Http\Requests\Modules\Bookings\ConfirmBookingRequest;
use App\Http\Requests\Modules\Bookings\GuestBookingsRequest;
use App\Http\Requests\Modules\Bookings\SearchAvailabilityRequest;
use App\Modules\Bookings\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class BookingController extends Controller
{
    public function __construct(
        private AvailabilityService $availabilityService,
    ) {}

    public function searchAvailability(SearchAvailabilityRequest $request): JsonResponse
    {
        $availableRooms = $this->availabilityService->checkAvailability(
            $request->validated('property_id'),
            $request->validated('check_in'),
            $request->validated('check_out'),
            $request->validated('guests', 1)
        );

        return response()->json([
            'data' => $availableRooms,
            'property_id' => $request->validated('property_id'),
            'check_in' => $request->validated('check_in'),
            'check_out' => $request->validated('check_out'),
        ]);
    }

    public function store(CreateBookingRequest $request, CreateBooking $action): JsonResponse
    {
        $booking = $action->handle(CreateBookingDTO::fromRequest($request));

        return response()->json(['data' => $booking], 201);
    }

    public function show(string $id, GetBooking $action): JsonResponse
    {
        $booking = $action->handle($id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        return response()->json(['data' => $booking]);
    }

    public function update(): JsonResponse
    {
        return response()->json(['message' => 'Use confirm/cancel endpoints'], 400);
    }

    public function destroy(string $id, CancelBooking $action, BookingRepositoryInterface $bookingRepo): JsonResponse
    {
        try {
            $booking = $bookingRepo->findOrFail($id);
            $updatedBooking = $action->handle($booking, '');

            return response()->json(['data' => $updatedBooking]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function confirm(string $id, ConfirmBookingRequest $request, UpdateBooking $action, BookingRepositoryInterface $bookingRepo): JsonResponse
    {
        try {
            $booking = $bookingRepo->findOrFail($id);
            $dto = new UpdateBookingDTO(status: BookingStatus::CONFIRMED);
            $updatedBooking = $action->handle($booking, $dto);

            return response()->json(['data' => $updatedBooking]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function cancel(string $id, CancelBookingRequest $request, CancelBooking $action, BookingRepositoryInterface $bookingRepo): JsonResponse
    {
        try {
            $booking = $bookingRepo->findOrFail($id);
            $reason = $request->validated('reason', '');
            $updatedBooking = $action->handle($booking, $reason);

            return response()->json(['data' => $updatedBooking]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function guestBookings(GuestBookingsRequest $request, GetBookings $action): JsonResponse
    {
        $bookings = $action->handle($request->validated('guest_id'));

        return response()->json(['data' => $bookings]);
    }

    public function checkIn(string $id, CheckInRequest $request, CheckInBooking $action, BookingRepositoryInterface $bookingRepo): JsonResponse
    {
        try {
            $booking = $bookingRepo->findOrFail($id);
            $notes = $request->validated('notes');
            $updatedBooking = $action->handle($booking, $notes);

            return response()->json(['data' => $updatedBooking]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function checkOut(string $id, CheckOutBooking $action, BookingRepositoryInterface $bookingRepo): JsonResponse
    {
        try {
            $booking = $bookingRepo->findOrFail($id);
            $updatedBooking = $action->handle($booking);

            return response()->json(['data' => $updatedBooking]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
