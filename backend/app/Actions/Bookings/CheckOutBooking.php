<?php

namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Enums\BookingStatus;
use App\Events\GuestCheckedOut;
use App\Exceptions\InvalidBookingStatusException;
use App\Models\Booking;

readonly class CheckOutBooking
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(Booking $booking, ?string $notes = null): Booking
    {
        if ($booking->status !== BookingStatus::CHECKED_IN) {
            throw new InvalidBookingStatusException('Booking must be checked in before check-out.');
        }

        $updatedBooking = $this->bookings->update($booking, [
            'status' => BookingStatus::COMPLETED,
            'checked_out_at' => now(),
            'check_out_notes' => $notes,
        ]);

        GuestCheckedOut::dispatch($updatedBooking);

        return $updatedBooking;
    }
}
