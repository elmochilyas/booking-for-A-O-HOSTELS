<?php

namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\DTO\CreateBookingDTO;
use App\Enums\BookingStatus;
use App\Events\BookingCreated;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;

readonly class CreateBooking
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
        private PropertyRepositoryInterface $properties,
    ) {}

    public function handle(CreateBookingDTO $dto): Booking
    {
        // Business validation
        if (!$this->properties->checkAvailability($dto->roomTypeId, $dto->checkInDate->toDateString(), $dto->checkOutDate->toDateString())) {
            throw new \App\Exceptions\RoomNotAvailableException('Selected room is not available for the chosen dates.');
        }

        $booking = DB::transaction(function () use ($dto) {
            $booking = $this->bookings->create([
                'id'             => (string) \Illuminate\Support\Str::uuid(),
                'property_id'    => $dto->propertyId,
                'room_type_id'   => $dto->roomTypeId,
                'guest_id'       => $dto->guestId,
                'check_in_date'  => $dto->checkInDate,
                'check_out_date' => $dto->checkOutDate,
                'guest_count'    => $dto->guestCount,
                'status'          => BookingStatus::PENDING,
                'source'          => $dto->source?->value,
                'special_requests' => $dto->specialRequests,
                'nights'          => $dto->getNights(),
            ]);

            // Load relationships
            $booking->load(['guest', 'roomType', 'property']);

            return $booking;
        });

        // Event fires AFTER commit (ShouldDispatchAfterCommit on the event)
        BookingCreated::dispatch($booking);

        return $booking;
    }
}
