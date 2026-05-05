<?php

namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\DTO\CreateBookingDTO;
use App\Enums\BookingStatus;
use App\Events\BookingCreated;
use App\Exceptions\RoomNotAvailableException;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

readonly class CreateBooking
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(CreateBookingDTO $dto): Booking
    {
        // Check availability
        if ($this->bookings->checkAvailability($dto->roomTypeId, $dto->checkInDate->toDateString(), $dto->checkOutDate->toDateString())) {
            throw new RoomNotAvailableException('Selected room type is not available for the chosen dates.');
        }

        $booking = DB::transaction(function () use ($dto) {
            // Find available room
            $room = $this->bookings->findAvailableRoom(
                $dto->propertyId,
                $dto->roomTypeId,
                $dto->checkInDate->toDateString(),
                $dto->checkOutDate->toDateString()
            );

            // Calculate total price
            $totalPrice = $this->bookings->calculateTotalPrice(
                $dto->propertyId,
                $dto->roomTypeId,
                $dto->checkInDate->toDateString(),
                $dto->checkOutDate->toDateString(),
                $dto->extras
            );

            // Create booking
            $booking = $this->bookings->create([
                'id' => (string) Str::uuid(),
                'property_id' => $dto->propertyId,
                'room_type_id' => $dto->roomTypeId,
                'guest_id' => $dto->guestId,
                'room_id' => $room?->id,
                'check_in_date' => $dto->checkInDate,
                'check_out_date' => $dto->checkOutDate,
                'guest_count' => $dto->guestCount,
                'status' => BookingStatus::PENDING,
                'source' => $dto->source?->value,
                'special_requests' => $dto->specialRequests,
                'nights' => $dto->getNights(),
                'total_price' => $totalPrice,
                'payment_status' => 'pending',
            ]);

            // Update room status if room was assigned
            if ($room) {
                Room::where('id', $room->id)->update(['status' => 'booked']);
            }

            return $booking->load(['guest', 'roomType', 'property']);
        });

        // Event fires AFTER commit (ShouldDispatchAfterCommit on the event)
        BookingCreated::dispatch($booking);

        return $booking;
    }
}
