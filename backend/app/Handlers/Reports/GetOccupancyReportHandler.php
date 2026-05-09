<?php

declare(strict_types=1);

namespace App\Handlers\Reports;

use App\Models\Booking;
use App\Queries\Reports\GetOccupancyReportQuery;
use Illuminate\Support\Facades\DB;

readonly class GetOccupancyReportHandler
{
    public function handle(GetOccupancyReportQuery $query): array
    {
        return Booking::where('property_id', $query->propertyId)
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
}
