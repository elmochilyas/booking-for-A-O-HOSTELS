<?php

namespace App\Queries;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;

readonly class GetADRQuery
{
    public function __construct(
        private BookingRepositoryInterface $bookingRepository,
        private PaymentRepositoryInterface $paymentRepository,
    ) {}

    public function handle(string $propertyId, string $startDate, string $endDate): float
    {
        $totalRevenue = $this->paymentRepository->getRevenueBetween($propertyId, $startDate, $endDate);
        $totalBookings = $this->bookingRepository->getBookingCount($propertyId, $startDate, $endDate);

        return $totalBookings > 0 ? round($totalRevenue / $totalBookings, 2) : 0.0;
    }
}
