<?php

namespace App\Modules\Staff\Services;

use App\Models\Booking;
use App\Models\Property;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    public function getOccupancyRate(string $propertyId, string $startDate, string $endDate): array
    {
        $totalRooms = Property::find($propertyId)?->total_rooms ?? 0;
        
        $bookings = Booking::where('property_id', $propertyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('check_in_date', [$startDate, $endDate])
            ->get();

        $totalNights = 0;
        $dateRange = (new \DateTime($startDate))->diff(new \DateTime($endDate))->days;

        foreach ($bookings as $booking) {
            $checkIn = new \DateTime($booking->check_in_date);
            $checkOut = new \DateTime($booking->check_out_date);
            $totalNights += $checkIn->diff($checkOut)->days;
        }

        $availableRoomNights = $totalRooms * $dateRange;
        $occupancyRate = $availableRoomNights > 0 ? ($totalNights / $availableRoomNights) * 100 : 0;

        return [
            'occupancy_rate' => round($occupancyRate, 2),
            'total_nights' => $totalNights,
            'available_nights' => $availableRoomNights,
            'date_range' => ['start' => $startDate, 'end' => $endDate],
        ];
    }

    public function getRevenueReport(string $propertyId, string $startDate, string $endDate): array
    {
        $totalRevenue = Payment::whereHas('booking', function ($query) use ($propertyId) {
            $query->where('property_id', $propertyId);
        })
        ->whereBetween('created_at', [$startDate, $endDate])
        ->where('status', 'success')
        ->sum('amount');

        $bookingCount = Booking::where('property_id', $propertyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $averageBookingValue = $bookingCount > 0 ? $totalRevenue / $bookingCount : 0;

        return [
            'total_revenue' => round($totalRevenue, 2),
            'booking_count' => $bookingCount,
            'average_booking_value' => round($averageBookingValue, 2),
            'date_range' => ['start' => $startDate, 'end' => $endDate],
        ];
    }

    public function getBookingStats(string $propertyId, string $startDate, string $endDate): array
    {
        $stats = Booking::where('property_id', $propertyId)
            ->whereBetween('check_in_date', [$startDate, $endDate])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        return [
            'confirmed' => $stats['confirmed'] ?? 0,
            'pending' => $stats['pending'] ?? 0,
            'cancelled' => $stats['cancelled'] ?? 0,
            'completed' => $stats['completed'] ?? 0,
            'checked_in' => $stats['checked_in'] ?? 0,
            'total' => array_sum($stats),
        ];
    }

    public function getDailyStats(string $propertyId, string $date): array
    {
        $checkIns = Booking::where('property_id', $propertyId)
            ->where('check_in_date', $date)
            ->where('status', 'confirmed')
            ->count();

        $checkOuts = Booking::where('property_id', $propertyId)
            ->where('check_out_date', $date)
            ->where('status', 'checked_in')
            ->count();

        $todayRevenue = Payment::whereHas('booking', function ($query) use ($propertyId, $date) {
            $query->where('property_id', $propertyId)
                ->whereDate('created_at', $date);
        })
        ->where('status', 'success')
        ->sum('amount');

        return [
            'date' => $date,
            'check_ins' => $checkIns,
            'check_outs' => $checkOuts,
            'revenue' => round($todayRevenue, 2),
        ];
    }

    public function getDashboardMetrics(string $propertyId): array
    {
        $today = date('Y-m-d');
        
        $todayStats = $this->getDailyStats($propertyId, $today);
        $occupancy = $this->getOccupancyRate($propertyId, $today, date('Y-m-d', strtotime('+30 days')));
        $revenue = $this->getRevenueReport($propertyId, date('Y-m-01'), $today);
        $bookings = $this->getBookingStats($propertyId, $today, date('Y-m-d', strtotime('+30 days')));

        return [
            'today' => $todayStats,
            'occupancy' => $occupancy['occupancy_rate'],
            'monthly_revenue' => $revenue['total_revenue'],
            'total_bookings' => $bookings['total'],
            'confirmed_bookings' => $bookings['confirmed'],
        ];
    }

    public function getADR(string $propertyId, string $startDate, string $endDate): float
    {
        $revenue = $this->getRevenueReport($propertyId, $startDate, $endDate);
        $stats = $this->getBookingStats($propertyId, $startDate, $endDate);
        
        $occupiedNights = $stats['checked_in'] + $stats['completed'];
        
        return $occupiedNights > 0 ? $revenue['total_revenue'] / $occupiedNights : 0;
    }

    public function getRevPAR(string $propertyId, string $startDate, string $endDate): float
    {
        $property = Property::find($propertyId);
        $totalRooms = $property?->total_rooms ?? 1;
        
        $dateRange = (new \DateTime($startDate))->diff(new \DateTime($endDate))->days;
        $availableRoomNights = $totalRooms * $dateRange;
        
        $revenue = $this->getRevenueReport($propertyId, $startDate, $endDate);
        
        return $availableRoomNights > 0 ? $revenue['total_revenue'] / $availableRoomNights : 0;
    }
}