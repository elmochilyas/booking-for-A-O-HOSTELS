<?php

namespace App\Queries\Reports;

readonly class GetGuestsReportQuery
{
    public function __construct(
        public string $propertyId,
        public string $startDate,
        public string $endDate,
    ) {}
}
