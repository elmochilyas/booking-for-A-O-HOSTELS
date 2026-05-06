<?php

namespace App\Modules\Payments\Services;

use App\Models\Booking;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    public function generateInvoice(string $bookingId): ?string
    {
        $booking = Booking::with(['property', 'roomType', 'guest', 'payments'])
            ->find($bookingId);

        if (! $booking) {
            return null;
        }

        $payments = Payment::where('booking_id', $bookingId)
            ->where('status', 'completed')
            ->get();

        $invoiceNumber = $this->generateInvoiceNumber($bookingId);

        $data = [
            'invoice_number' => $invoiceNumber,
            'booking' => $booking,
            'payments' => $payments,
            'guest' => $booking->guest,
            'property' => $booking->property,
            'room_type' => $booking->roomType,
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => $booking->check_in_date,
        ];

        $pdf = Pdf::loadView('invoices.booking', $data);

        $filename = "invoices/{$invoiceNumber}.pdf";
        Storage::put($filename, $pdf->output());

        return $filename;
    }

    private function generateInvoiceNumber(string $bookingId): string
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $shortId = substr($bookingId, -6);

        return "{$prefix}-{$date}-{$shortId}";
    }

    public function generateReceipt(string $paymentId): ?string
    {
        $payment = Payment::with(['booking.guest', 'booking.property'])
            ->find($paymentId);

        if (! $payment) {
            return null;
        }

        $receiptNumber = $this->generateReceiptNumber($paymentId);

        $data = [
            'receipt_number' => $receiptNumber,
            'payment' => $payment,
            'guest' => $payment->booking->guest,
            'property' => $payment->booking->property,
            'issue_date' => now()->format('Y-m-d'),
        ];

        $pdf = Pdf::loadView('invoices.receipt', $data);

        $filename = "receipts/{$receiptNumber}.pdf";
        Storage::put($filename, $pdf->output());

        return $filename;
    }

    private function generateReceiptNumber(string $paymentId): string
    {
        $prefix = 'RCP';
        $date = now()->format('Ymd');
        $shortId = substr($paymentId, -6);

        return "{$prefix}-{$date}-{$shortId}";
    }

    public function getInvoiceDownloadPath(string $bookingId): ?string
    {
        $booking = Booking::find($bookingId);
        if (! $booking) {
            return null;
        }

        $invoiceNumber = $this->generateInvoiceNumber($bookingId);
        $path = "invoices/{$invoiceNumber}.pdf";

        if (Storage::exists($path)) {
            return Storage::path($path);
        }

        return $this->generateInvoice($bookingId);
    }
}
