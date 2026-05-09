<?php

declare(strict_types=1);

namespace App\Actions\Payments;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

readonly class HandlePaymentSucceeded
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(string $stripePaymentId): void
    {
        DB::transaction(function () use ($stripePaymentId) {
            $payment = $this->payments->findByStripeId($stripePaymentId);

            if (! $payment) {
                return;
            }

            $this->payments->update($payment, ['status' => 'completed']);

            $booking = $payment->booking;
            $this->updateBookingPaymentStatus($booking, $payment);
        });
    }

    private function updateBookingPaymentStatus(Booking $booking, Payment $payment): void
    {
        $totalPaid = $booking->payments()
            ->where('status', 'completed')
            ->sum('amount');

        $booking->load('payments');

        if ($totalPaid >= $booking->total_price) {
            $this->bookings->update($booking, [
                'payment_status' => 'paid',
                'status' => $booking->status === 'pending' ? 'confirmed' : $booking->status,
            ]);
        } elseif ($totalPaid > 0) {
            $percentage = ($totalPaid / $booking->total_price) * 100;
            $this->bookings->update($booking, ['payment_status' => $percentage >= 50 ? 'partial' : 'pending']);
        }
    }
}
