<?php

declare(strict_types=1);

namespace App\Actions\Invoices;

use App\Contracts\Repositories\BookingRepositoryInterface;
use Barryvdh\DomPDF\Facade\Pdf;

readonly class GenerateInvoicePdf
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(string $bookingId)
    {
        $booking = $this->bookings->findOrFail($bookingId)->load(['property', 'roomType', 'guest', 'payments']);

        $totalPaid = $booking->payments->where('status', 'completed')->sum('amount');

        $pdf = Pdf::loadView('invoices.template', [
            'booking' => $booking,
            'property' => $booking->property,
            'guest' => $booking->guest,
            'payments' => $booking->payments->where('status', 'completed'),
            'total_paid' => $totalPaid,
            'generated_at' => now(),
        ]);

        return $pdf->download("invoice-{$booking->id}.pdf");
    }
}
