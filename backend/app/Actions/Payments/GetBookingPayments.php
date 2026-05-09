<?php

declare(strict_types=1);

namespace App\Actions\Payments;

use App\Contracts\Repositories\BookingRepositoryInterface;

readonly class GetBookingPayments
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(string $bookingId): array
    {
        $booking = $this->bookings->findOrFail($bookingId);

        return [
            'payments' => $booking->payments,
            'total_paid' => $booking->payments()->where('status', 'completed')->sum('amount'),
        ];
    }
}
