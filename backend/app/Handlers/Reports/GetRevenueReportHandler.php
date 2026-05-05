<?php

namespace App\Handlers\Reports;

use App\Models\Booking;
use App\Queries\Reports\GetRevenueReportQuery;
use Illuminate\Support\Facades\DB;

readonly class GetRevenueReportHandler
{
    public function handle(GetRevenueReportQuery $query): array
    {
        return Booking::where('property_id', $query->propertyId)
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
}
