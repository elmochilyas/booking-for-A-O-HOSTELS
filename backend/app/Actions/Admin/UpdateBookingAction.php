<?php

namespace App\Actions\Admin;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Models\Booking;

readonly class UpdateBookingAction
{
    public function __construct(
        private BookingRepositoryInterface $bookingRepository,
    ) {}

    public function handle(Booking $booking, array $data): Booking
    {
        return $this->bookingRepository->update($booking, $data);
    }
}
