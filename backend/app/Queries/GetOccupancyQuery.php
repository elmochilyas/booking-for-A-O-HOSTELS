<?php

declare(strict_types=1);

namespace App\Queries;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Models\Booking;
use App\Models\Property;

readonly class GetOccupancyQuery
{
    public function __construct(
        private BookingRepositoryInterface $bookingRepository,
    ) {}

    public function handle(string $propertyId, string $startDate, string $endDate): array
    {
        $query = Booking::where('property_id', $propertyId)
            ->whereBetween('check_in_date', [$startDate, $endDate])
            ->whereIn('status', ['confirmed', 'completed']);

        $totalBookings = $query->count();
        $confirmedBookings = $query->where('status', 'confirmed')->count();

        $property = Property::findOrFail($propertyId);
        $totalRooms = $property->rooms()->count();

        $nights = $query->sum(\DB::raw('DATEDIFF(check_out_date, check_in_date)'));
        $occupiedNights = $confirmedBookings * max(1, $nights / max(1, $totalBookings));

        $occupancyRate = $totalRooms > 0 ? ($occupiedNights / max(1, $nights)) * 100 : 0;

        return [
            'occupancy_rate' => round($occupancyRate, 1),
            'total_bookings' => $totalBookings,
            'confirmed_bookings' => $confirmedBookings,
            'total_rooms' => $totalRooms,
        ];
    }
}
