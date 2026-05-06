<?php

namespace App\Queries;

use App\Contracts\Repositories\BookingRepositoryInterface;

readonly class GetBookingStatsQuery
{
    public function __construct(
        private BookingRepositoryInterface $bookingRepository,
    ) {}

    public function handle(string $propertyId, string $startDate, string $endDate): array
    {
        return $this->bookingRepository->getStats($propertyId, $startDate, $endDate);
    }
}
