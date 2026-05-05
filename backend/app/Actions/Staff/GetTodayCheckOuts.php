<?php

namespace App\Actions\Staff;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Models\Staff;

readonly class GetTodayCheckOuts
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(Staff $staff): array
    {
        $today = now()->toDateString();

        $checkOuts = $this->bookings->getByPropertyAndStatus(
            $staff->property_id,
            'checked_in',
            'check_out_date',
            $today,
            ['guest']
        );

        return [
            'check_outs' => $checkOuts,
            'count' => $checkOuts->count(),
        ];
    }
}
