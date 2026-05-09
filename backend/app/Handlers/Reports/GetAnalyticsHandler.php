<?php

declare(strict_types=1);

namespace App\Handlers\Reports;

use App\Models\Booking;
use App\Queries\Reports\GetAnalyticsQuery;
use App\Services\ReportService;
use Illuminate\Support\Facades\DB;

readonly class GetAnalyticsHandler
{
    public function __construct(
        private ReportService $reportService,
    ) {}

    public function handle(GetAnalyticsQuery $query): array
    {
        $occupancy = $this->reportService->calculateOccupancy(
            $query->propertyId,
            $query->startDate,
            $query->endDate
        );
        $revenue = $this->reportService->calculateRevenue(
            $query->propertyId,
            $query->startDate,
            $query->endDate
        );
        $adr = $this->reportService->calculateADR(
            $query->propertyId,
            $query->startDate,
            $query->endDate
        );
        $revpar = $this->reportService->calculateRevPAR(
            $query->propertyId,
            $query->startDate,
            $query->endDate
        );

        $bookingsByStatus = Booking::where('property_id', $query->propertyId)
            ->whereBetween('check_in_date', [$query->startDate, $query->endDate])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $dailyRevenues = Booking::where('property_id', $query->propertyId)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->whereBetween('check_in_date', [$query->startDate, $query->endDate])
            ->select(
                DB::raw('DATE(check_in_date) as date'),
                DB::raw('SUM(total_price) as revenue'),
                DB::raw('COUNT(*) as bookings')
            )
            ->groupBy(DB::raw('DATE(check_in_date)'))
            ->orderBy('date')
            ->get();

        return [
            'property_id' => $query->propertyId,
            'period' => [
                'start' => $query->startDate,
                'end' => $query->endDate,
            ],
            'metrics' => [
                'occupancy_rate' => $occupancy,
                'total_revenue' => $revenue,
                'adr' => $adr,
                'revpar' => $revpar,
            ],
            'bookings_by_status' => $bookingsByStatus,
            'daily_revenues' => $dailyRevenues,
        ];
    }
}
