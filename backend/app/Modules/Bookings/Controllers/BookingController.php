<?php

namespace App\Modules\Bookings\Controllers;

use App\Modules\Bookings\Services\AvailabilityService;
use App\Modules\Bookings\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController
{
    private BookingService $bookingService;

    private AvailabilityService $availabilityService;

    public function __construct(BookingService $bookingService, AvailabilityService $availabilityService)
    {
        $this->bookingService = $bookingService;
        $this->availabilityService = $availabilityService;
    }

    public function searchAvailability(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $availableRooms = $this->availabilityService->checkAvailability(
            $request->property_id,
            $request->check_in,
            $request->check_out,
            $request->guests ?? 1
        );

        return response()->json([
            'data' => $availableRooms,
            'property_id' => $request->property_id,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $result = $this->bookingService->createBooking($request);

        if (! $result['success']) {
            $status = isset($result['errors']) ? 422 : 400;

            return response()->json($result, $status);
        }

        return response()->json($result, 201);
    }

    public function show(string $id): JsonResponse
    {
        $booking = $this->bookingService->getBooking($id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        return response()->json(['data' => $booking]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        return response()->json(['message' => 'Use confirm/cancel endpoints'], 400);
    }

    public function destroy(string $id): JsonResponse
    {
        $result = $this->bookingService->cancelBooking($id);

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function confirm(string $id): JsonResponse
    {
        $result = $this->bookingService->confirmBooking($id);

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $result = $this->bookingService->cancelBooking($id);

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function guestBookings(string $guestId): JsonResponse
    {
        $bookings = $this->bookingService->getGuestBookings($guestId);

        return response()->json(['data' => $bookings]);
    }

    public function checkIn(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'room_id' => 'nullable|uuid',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->bookingService->checkIn($id, $request->room_id);

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function checkOut(string $id): JsonResponse
    {
        $result = $this->bookingService->checkOut($id);

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }
}
