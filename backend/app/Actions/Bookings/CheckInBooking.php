<?php

namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Enums\BookingStatus;
use App\Events\GuestCheckedIn;
use App\Exceptions\InvalidBookingStatusException;
use App\Models\Booking;

readonly class CheckInBooking
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(Booking $booking, ?string $notes = null): Booking
    {
        if ($booking->status !== BookingStatus::CONFIRMED) {
            throw new InvalidBookingStatusException('Booking must be confirmed before check-in.');
        }

        $updatedBooking = $this->bookings->update($booking, [
            'status' => BookingStatus::CHECKED_IN,
            'checked_in_at' => now(),
            'check_in_notes' => $notes,
        ]);

        GuestCheckedIn::dispatch($updatedBooking);

        return $updatedBooking;
    }
}
