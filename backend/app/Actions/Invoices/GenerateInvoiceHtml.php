<?php

declare(strict_types=1);

namespace App\Actions\Invoices;

use App\Contracts\Repositories\BookingRepositoryInterface;

readonly class GenerateInvoiceHtml
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(string $bookingId): array
    {
        $booking = $this->bookings->findOrFail($bookingId)->load(['property', 'roomType', 'guest', 'payments']);

        $data = [
            'booking' => $booking,
            'property' => $booking->property,
            'guest' => $booking->guest,
            'payments' => $booking->payments->where('status', 'completed'),
            'generated_at' => now(),
        ];

        $html = view('invoices.template', $data)->render();

        return [
            'booking_id' => $bookingId,
            'invoice_html' => $html,
            'invoice_data' => $data,
        ];
    }
}
