<?php

declare(strict_types=1);

namespace App\Actions\Guests;

use App\Contracts\Repositories\BookingRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

readonly class GetGuestBookings
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(string $guestId, array $filters = []): LengthAwarePaginator
    {
        return $this->bookings->findByGuest($guestId, $filters);
    }
}
