<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function analytics(Request $request): JsonResponse
    {
        $propertyId = $request->property_id ?? Property::first()->id ?? null;

        if (! $propertyId) {
            return response()->json(['error' => 'No property found'], 404);
        }

        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        $occupancy = $this->calculateOccupancy($propertyId, $startDate, $endDate);
        $revenue = $this->calculateRevenue($propertyId, $startDate, $endDate);
        $adr = $this->calculateADR($propertyId, $startDate, $endDate);
        $revpar = $this->calculateRevPAR($propertyId, $startDate, $endDate);

        $bookingsByStatus = Booking::where('property_id', $propertyId)
            ->whereBetween('check_in_date', [$startDate, $endDate])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $dailyRevenues = Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->whereBetween('check_in_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(check_in_date) as date'),
                DB::raw('SUM(total_price) as revenue'),
                DB::raw('COUNT(*) as bookings')
            )
            ->groupBy(DB::raw('DATE(check_in_date)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'property_id' => $propertyId,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'metrics' => [
                'occupancy_rate' => $occupancy,
                'total_revenue' => $revenue,
                'adr' => $adr,
                'revpar' => $revpar,
            ],
            'bookings_by_status' => $bookingsByStatus,
            'daily_revenues' => $dailyRevenues,
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        $propertyId = $request->property_id ?? Property::first()->id ?? null;

        if (! $propertyId) {
            return response()->json(['error' => 'No property found'], 404);
        }

        $type = $request->type ?? 'occupancy';
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        $data = match ($type) {
            'occupancy' => $this->occupancyReport($propertyId, $startDate, $endDate),
            'revenue' => $this->revenueReport($propertyId, $startDate, $endDate),
            'bookings' => $this->bookingsReport($propertyId, $startDate, $endDate),
            'guests' => $this->guestsReport($propertyId, $startDate, $endDate),
            default => [],
        };

        return response()->json([
            'type' => $type,
            'property_id' => $propertyId,
            'period' => ['start' => $startDate, 'end' => $endDate],
            'data' => $data,
        ]);
    }

    private function calculateOccupancy(string $propertyId, string $start, string $end): float
    {
        $property = Property::find($propertyId);
        $totalRooms = $property->total_rooms ?? 1;

        $days = (strtotime($end) - strtotime($start)) / (60 * 60 * 24) + 1;

        $occupiedRoomNights = Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('check_in_date', [$start, $end])
                    ->orWhereBetween('check_out_date', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('check_in_date', '<=', $start)
                            ->where('check_out_date', '>=', $end);
                    });
            })
            ->count();

        $availableRoomNights = $totalRooms * $days;

        return $availableRoomNights > 0
            ? round(($occupiedRoomNights / $availableRoomNights) * 100, 2)
            : 0;
    }

    private function calculateRevenue(string $propertyId, string $start, string $end): float
    {
        return Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->whereBetween('check_in_date', [$start, $end])
            ->sum('total_price');
    }

    private function calculateADR(string $propertyId, string $start, string $end): float
    {
        $totalRevenue = $this->calculateRevenue($propertyId, $start, $end);
        $totalBookings = Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->whereBetween('check_in_date', [$start, $end])
            ->count();

        return $totalBookings > 0 ? round($totalRevenue / $totalBookings, 2) : 0;
    }

    private function calculateRevPAR(string $propertyId, string $start, string $end): float
    {
        $revenue = $this->calculateRevenue($propertyId, $start, $end);
        $property = Property::find($propertyId);
        $totalRooms = $property->total_rooms ?? 1;
        $days = (strtotime($end) - strtotime($start)) / (60 * 60 * 24) + 1;

        return round($revenue / ($totalRooms * $days), 2);
    }

    private function occupancyReport(string $propertyId, string $start, string $end): array
    {
        return Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->select(
                DB::raw('DATE(check_in_date) as date'),
                DB::raw('COUNT(*) as bookings')
            )
            ->groupBy(DB::raw('DATE(check_in_date)'))
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    private function revenueReport(string $propertyId, string $start, string $end): array
    {
        return Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->select(
                DB::raw('DATE(check_in_date) as date'),
                DB::raw('SUM(total_price) as revenue'),
                DB::raw('COUNT(*) as bookings')
            )
            ->groupBy(DB::raw('DATE(check_in_date)'))
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    private function bookingsReport(string $propertyId, string $start, string $end): array
    {
        return Booking::where('property_id', $propertyId)
            ->whereBetween('check_in_date', [$start, $end])
            ->select('id', 'guest_id', 'check_in_date', 'check_out_date', 'total_price', 'status')
            ->orderBy('check_in_date')
            ->get()
            ->toArray();
    }

    private function guestsReport(string $propertyId, string $start, string $end): array
    {
        return Booking::where('property_id', $propertyId)
            ->whereBetween('check_in_date', [$start, $end])
            ->with('guest:id,first_name,last_name,email,country')
            ->select('id', 'guest_id', 'guest_count')
            ->orderBy('check_in_date')
            ->get()
            ->toArray();
    }
}
