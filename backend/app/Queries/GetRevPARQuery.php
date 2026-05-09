<?php

declare(strict_types=1);

namespace App\Queries;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Models\Property;

readonly class GetRevPARQuery
{
    public function __construct(
        private BookingRepositoryInterface $bookingRepository,
        private PaymentRepositoryInterface $paymentRepository,
    ) {}

    public function handle(string $propertyId, string $startDate, string $endDate): float
    {
        $totalRevenue = $this->paymentRepository->getRevenueBetween($propertyId, $startDate, $endDate);
        $property = Property::findOrFail($propertyId);
        $totalRooms = $property->rooms()->count();

        return $totalRooms > 0 ? round($totalRevenue / $totalRooms, 2) : 0.0;
    }
}
