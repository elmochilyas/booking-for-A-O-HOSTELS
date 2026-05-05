<?php

namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Enums\BookingStatus;
use App\Events\BookingCancelled;
use App\Exceptions\InvalidBookingStatusException;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;

readonly class CancelBooking
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(Booking $booking, string $reason): Booking
    {
        if ($booking->status->isTerminal()) {
            throw new InvalidBookingStatusException('Cannot cancel a booking with status: '.$booking->status->value);
        }

        $updatedBooking = DB::transaction(function () use ($booking, $reason) {
            return $this->bookings->update($booking, [
                'status' => BookingStatus::CANCELLED,
                'cancellation_reason' => $reason,
                'cancelled_at' => now(),
            ]);
        });

        BookingCancelled::dispatch($updatedBooking);

        return $updatedBooking;
    }
}
