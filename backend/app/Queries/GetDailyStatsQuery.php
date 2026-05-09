<?php

declare(strict_types=1);

namespace App\Queries;

use App\Contracts\Repositories\BookingRepositoryInterface;

readonly class GetDailyStatsQuery
{
    public function __construct(
        private BookingRepositoryInterface $bookingRepository,
    ) {}

    public function handle(string $propertyId, string $date): array
    {
        return $this->bookingRepository->getDailyStats($propertyId, $date);
    }
}
