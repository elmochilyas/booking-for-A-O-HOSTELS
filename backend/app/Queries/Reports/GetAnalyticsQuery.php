<?php

declare(strict_types=1);

namespace App\Queries\Reports;

readonly class GetAnalyticsQuery
{
    public function __construct(
        public string $propertyId,
        public string $startDate,
        public string $endDate,
    ) {}
}
