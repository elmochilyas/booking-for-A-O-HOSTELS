<?php

namespace App\Actions\Staff;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Models\Staff;

readonly class GetTodayCheckIns
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(Staff $staff): array
    {
        $today = now()->toDateString();

        $checkIns = $this->bookings->getByPropertyAndStatus(
            $staff->property_id,
            'confirmed',
            'check_in_date',
            $today,
            ['guest']
        );

        return [
            'check_ins' => $checkIns,
            'count' => $checkIns->count(),
        ];
    }
}
