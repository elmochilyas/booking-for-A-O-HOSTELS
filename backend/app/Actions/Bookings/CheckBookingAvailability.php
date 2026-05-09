<?php

declare(strict_types=1);

namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;

readonly class CheckBookingAvailability
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(string $propertyId, string $checkIn, string $checkOut): array
    {
        return $this->bookings->getAvailableRooms(
            $propertyId,
            $checkIn,
            $checkOut
        );
    }
}
