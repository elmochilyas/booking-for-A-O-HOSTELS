<?php

declare(strict_types=1);

namespace App\Actions\Staff;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Models\Staff;

readonly class GetStaffDashboard
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(Staff $staff): array
    {
        $propertyId = $staff->property_id;
        $today = now()->toDateString();

        return [
            'check_ins_today' => $this->bookings->countByPropertyAndStatus($propertyId, 'confirmed', 'check_in_date', $today),
            'check_outs_today' => $this->bookings->countByPropertyAndStatus($propertyId, 'checked_in', 'check_out_date', $today),
            'in_house' => $this->bookings->countByPropertyAndStatus($propertyId, 'checked_in'),
            'pending_bookings' => $this->bookings->countByPropertyAndStatus($propertyId, 'pending'),
            'todays_revenue' => $this->bookings->sumRevenueByPropertyAndDate($propertyId, ['confirmed', 'checked_in', 'completed'], $today),
        ];
    }
}
