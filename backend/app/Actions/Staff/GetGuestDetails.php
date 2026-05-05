<?php

namespace App\Actions\Staff;

use App\Contracts\Repositories\BookingRepositoryInterface;

readonly class GetGuestDetails
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(string $id): array
    {
        $booking = $this->bookings->findOrFail($id)->load(['guest', 'property', 'roomType', 'payments']);

        return [
            'booking' => $booking,
            'guest' => $booking->guest,
        ];
    }
}
