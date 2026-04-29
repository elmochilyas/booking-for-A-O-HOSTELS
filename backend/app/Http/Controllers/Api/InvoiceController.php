<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Guest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    public function generate(string $bookingId): JsonResponse
    {
        $booking = Booking::with(['property', 'roomType', 'guest', 'payments'])
            ->find($bookingId);
        
        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        $data = [
            'booking' => $booking,
            'property' => $booking->property,
            'guest' => $booking->guest,
            'payments' => $booking->payments->where('status', 'success'),
            'generated_at' => now(),
        ];

        $html = view('invoices.template', $data)->render();

        return response()->json([
            'booking_id' => $bookingId,
            'invoice_html' => $html,
            'invoice_data' => $data,
        ]);
    }

    public function download(string $bookingId)
    {
        $booking = Booking::with(['property', 'roomType', 'guest', 'payments'])
            ->find($bookingId);
        
        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        $totalPaid = $booking->payments->where('status', 'success')->sum('amount');

        $pdf = Pdf::loadView('invoices.template', [
            'booking' => $booking,
            'property' => $booking->property,
            'guest' => $booking->guest,
            'payments' => $booking->payments->where('status', 'success'),
            'total_paid' => $totalPaid,
            'generated_at' => now(),
        ]);

        return $pdf->download("invoice-{$booking->id}.pdf");
    }
}