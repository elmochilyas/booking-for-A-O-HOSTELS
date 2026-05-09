<?php

declare(strict_types=1);

namespace App\Handlers\Reports;

use App\Models\Booking;
use App\Queries\Reports\GetBookingsReportQuery;

readonly class GetBookingsReportHandler
{
    public function handle(GetBookingsReportQuery $query): array
    {
        return Booking::where('property_id', $query->propertyId)
            ->whereBetween('check_in_date', [$query->startDate, $query->endDate])
            ->select('id', 'guest_id', 'check_in_date', 'check_out_date', 'total_price', 'status')
            ->orderBy('check_in_date')
            ->get()
            ->toArray();
    }
}
