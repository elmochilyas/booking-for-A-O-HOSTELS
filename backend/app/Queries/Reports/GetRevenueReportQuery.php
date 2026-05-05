<?php

namespace App\Queries\Reports;

readonly class GetRevenueReportQuery
{
    public function __construct(
        public string $propertyId,
        public string $startDate,
        public string $endDate,
    ) {}
}
