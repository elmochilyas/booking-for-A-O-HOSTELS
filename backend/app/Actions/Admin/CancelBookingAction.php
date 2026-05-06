<?php

namespace App\Actions\Admin;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Models\Booking;

readonly class CancelBookingAction
{
    public function __construct(
        private BookingRepositoryInterface $bookingRepository,
    ) {}

    public function handle(string $bookingId, ?string $reason = null): Booking
    {
        $booking = $this->bookingRepository->findOrFail($bookingId);

        return $this->bookingRepository->update($booking, [
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);
    }
}
