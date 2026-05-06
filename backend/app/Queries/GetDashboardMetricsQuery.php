<?php

namespace App\Queries;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Models\Property;

readonly class GetDashboardMetricsQuery
{
    public function __construct(
        private BookingRepositoryInterface $bookingRepository,
        private PaymentRepositoryInterface $paymentRepository,
    ) {}

    public function handle(string $propertyId): array
    {
        $property = Property::findOrFail($propertyId);

        $todayBookings = $this->bookingRepository->getTodayBookings($propertyId);
        $todayCheckIns = $this->bookingRepository->getTodayCheckIns($propertyId);
        $todayCheckOuts = $this->bookingRepository->getTodayCheckOuts($propertyId);

        $occupancyRate = $this->bookingRepository->getOccupancyRate($propertyId);
        $revenue = $this->paymentRepository->getTotalRevenue($propertyId);

        return [
            'property_name' => $property->name,
            'today_bookings' => $todayBookings,
            'today_check_ins' => $todayCheckIns,
            'today_check_outs' => $todayCheckOuts,
            'occupancy_rate' => $occupancyRate,
            'total_revenue' => $revenue,
            'total_rooms' => $property->rooms()->count(),
        ];
    }
}
