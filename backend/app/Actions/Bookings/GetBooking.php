<?php

namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Models\Booking;

readonly class GetBooking
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(string $id): Booking
    {
        return $this->bookings->findOrFail($id);
    }
}
