<?php

namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

readonly class GetBookings
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->bookings->getPaginated($filters, $perPage);
    }
}
