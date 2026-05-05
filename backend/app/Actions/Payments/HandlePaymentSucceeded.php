<?php

namespace App\Actions\Payments;

use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Models\Booking;
use App\Models\Payment;

readonly class HandlePaymentSucceeded
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
    ) {}

    public function handle(string $stripePaymentId): void
    {
        $payment = Payment::where('stripe_payment_id', $stripePaymentId)->first();

        if (! $payment) {
            return;
        }

        $payment->update(['status' => 'success']);

        $booking = $payment->booking;
        $this->updateBookingPaymentStatus($booking, $payment);
    }

    private function updateBookingPaymentStatus(Booking $booking, Payment $payment): void
    {
        $totalPaid = $booking->payments()
            ->where('status', 'success')
            ->sum('amount');

        $booking->load('payments');

        if ($totalPaid >= $booking->total_price) {
            $booking->update([
                'payment_status' => 'paid',
                'status' => $booking->status === 'pending' ? 'confirmed' : $booking->status,
            ]);
        } elseif ($totalPaid > 0) {
            $percentage = ($totalPaid / $booking->total_price) * 100;
            $booking->update(['payment_status' => $percentage >= 50 ? 'partial' : 'pending']);
        }
    }
}
