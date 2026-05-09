<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PropertyRepositoryInterface;

class ReportService
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
        private PropertyRepositoryInterface $properties,
    ) {}

    public function calculateOccupancy(string $propertyId, string $start, string $end): float
    {
        $property = $this->properties->findOrFail($propertyId);
        $totalRooms = $property->total_rooms ?? 1;
        $days = max(1, (strtotime($end) - strtotime($start)) / (60 * 60 * 24) + 1);

        $occupiedRoomNights = $this->bookings->countOccupiedRoomNights($propertyId, $start, $end);
        $availableRoomNights = $totalRooms * $days;

        return $availableRoomNights > 0
            ? round(($occupiedRoomNights / $availableRoomNights) * 100, 2)
            : 0;
    }

    public function calculateRevenue(string $propertyId, string $start, string $end): float
    {
        return $this->bookings->getRevenueByPeriod($start, $end, $propertyId);
    }

    public function calculateADR(string $propertyId, string $start, string $end): float
    {
        $totalRevenue = $this->calculateRevenue($propertyId, $start, $end);
        $totalBookings = $this->bookings->countByPeriodAndStatus(
            $propertyId,
            $start,
            $end,
            ['confirmed', 'checked_in', 'completed']
        );

        return $totalBookings > 0 ? round($totalRevenue / $totalBookings, 2) : 0;
    }

    public function calculateRevPAR(string $propertyId, string $start, string $end): float
    {
        $revenue = $this->calculateRevenue($propertyId, $start, $end);
        $property = $this->properties->findOrFail($propertyId);
        $totalRooms = $property->total_rooms ?? 1;
        $days = max(1, (strtotime($end) - strtotime($start)) / (60 * 60 * 24) + 1);

        return round($revenue / ($totalRooms * $days), 2);
    }
}
