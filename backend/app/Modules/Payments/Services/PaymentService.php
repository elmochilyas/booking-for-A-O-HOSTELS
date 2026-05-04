<?php

namespace App\Modules\Payments\Services;

use App\Models\Booking;
use App\Models\Payment;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\Stripe;

class PaymentService
{
    private float $depositPercentage = 0.20;

    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createPaymentIntent(string $bookingId, bool $isDeposit = true): array
    {
        $booking = Booking::find($bookingId);

        if (! $booking) {
            return ['success' => false, 'message' => 'Booking not found'];
        }

        $amount = $isDeposit
            ? $this->calculateDeposit($booking->total_price)
            : $booking->total_price;

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($amount * 100),
                'currency' => 'eur',
                'metadata' => [
                    'booking_id' => $bookingId,
                    'type' => $isDeposit ? 'deposit' : 'balance',
                ],
            ]);

            $payment = Payment::create([
                'booking_id' => $bookingId,
                'amount' => $amount,
                'payment_method' => 'card',
                'status' => 'pending',
                'stripe_payment_id' => $paymentIntent->id,
                'stripe_client_secret' => $paymentIntent->client_secret,
            ]);

            return [
                'success' => true,
                'data' => [
                    'client_secret' => $paymentIntent->client_secret,
                    'payment_id' => $payment->id,
                    'amount' => $amount,
                    'currency' => 'eur',
                ],
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Failed to create payment: '.$e->getMessage()];
        }
    }

    public function confirmPayment(string $paymentId): array
    {
        $payment = Payment::find($paymentId);

        if (! $payment) {
            return ['success' => false, 'message' => 'Payment not found'];
        }

        try {
            $paymentIntent = PaymentIntent::retrieve($payment->stripe_payment_id);

            if ($paymentIntent->status === 'succeeded') {
                $payment->update(['status' => 'success']);

                $booking = Booking::find($payment->booking_id);
                $this->updateBookingPaymentStatus($booking, $payment->amount);

                return ['success' => true, 'message' => 'Payment confirmed'];
            }

            return ['success' => false, 'message' => 'Payment not completed'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Failed to confirm payment'];
        }
    }

    private function updateBookingPaymentStatus(Booking $booking, float $paidAmount): void
    {
        $totalPrice = $booking->total_price;
        $deposit = $this->calculateDeposit($totalPrice);

        if ($paidAmount >= $totalPrice) {
            $booking->update(['payment_status' => 'paid', 'status' => 'confirmed']);
        } elseif ($paidAmount >= $deposit) {
            $booking->update(['payment_status' => 'partial']);
        }
    }

    private function calculateDeposit(float $totalPrice): float
    {
        return round($totalPrice * $this->depositPercentage, 2);
    }

    public function getDepositAmount(float $totalPrice): float
    {
        return $this->calculateDeposit($totalPrice);
    }

    public function getBalanceAmount(float $totalPrice): float
    {
        $deposit = $this->calculateDeposit($totalPrice);

        return round($totalPrice - $deposit, 2);
    }

    public function processRefund(string $paymentId): array
    {
        $payment = Payment::find($paymentId);

        if (! $payment || $payment->status !== 'success') {
            return ['success' => false, 'message' => 'Payment not found or not eligible for refund'];
        }

        try {
            Refund::create([
                'payment_intent' => $payment->stripe_payment_id,
            ]);

            $payment->update(['status' => 'refunded']);

            return ['success' => true, 'message' => 'Refund processed successfully'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Failed to process refund'];
        }
    }

    public function getPaymentByBooking(string $bookingId): array
    {
        return Payment::where('booking_id', $bookingId)->get()->toArray();
    }

    public function calculateTotalPaid(string $bookingId): float
    {
        return Payment::where('booking_id', $bookingId)
            ->where('status', 'success')
            ->sum('amount');
    }
}
