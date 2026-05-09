<?php

declare(strict_types=1);

namespace App\Handlers\Reports;

use App\Models\Booking;
use App\Queries\Reports\GetGuestsReportQuery;

readonly class GetGuestsReportHandler
{
    public function handle(GetGuestsReportQuery $query): array
    {
        return Booking::where('property_id', $query->propertyId)
            ->whereBetween('check_in_date', [$query->startDate, $query->endDate])
            ->with('guest:id,first_name,last_name,email,country')
            ->select('id', 'guest_id', 'guest_count')
            ->orderBy('check_in_date')
            ->get()
            ->toArray();
    }
}
