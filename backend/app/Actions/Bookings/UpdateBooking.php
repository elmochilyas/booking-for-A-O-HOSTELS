<?php

declare(strict_types=1);

namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\DTO\UpdateBookingDTO;
use App\Models\Booking;

readonly class UpdateBooking
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(Booking $booking, UpdateBookingDTO $dto): Booking
    {
        $data = $dto->toArray();

        $updatedBooking = $this->bookings->update($booking, $data);

        return $updatedBooking;
    }
}
