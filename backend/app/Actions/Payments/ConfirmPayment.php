<?php

namespace App\Actions\Payments;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\DTO\ConfirmPaymentDTO;
use App\Events\PaymentProcessed;
use App\Exceptions\InvalidPaymentStatusException;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

readonly class ConfirmPayment'
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
        private BookingRepositoryInterface $bookings,
        private \App\Services\StripeService $stripeService,
        private \App\Services\EmailService $emailService,
    ) {}

    public function handle(ConfirmPaymentDTO $dto): array'
    {
        $payment = $this->payments->findOrFail($dto->paymentId);

        if ($payment->stripe_payment_id !== $dto->paymentIntentId) {
            throw new \Exception('Payment intent mismatch');
        }

        try {
            $stripePayment = $this->stripeService->retrievePayment($dto->paymentIntentId);

            if ($stripePayment->status === 'succeeded') {
                $this->payments->update($payment, [
                    'status' => 'success',
                ]);

                $booking = $payment->booking;
                $this->updateBookingPaymentStatus($booking, $payment);

                $this->emailService->sendPaymentConfirmation($booking, $payment);

                PaymentProcessed::dispatch($payment->fresh());

                return [
                    'message' => 'Payment successful',
                    'payment' => $payment->fresh(),
                ];
            }

            return [
                'error' => 'Payment not completed',
                'stripe_status' => $stripePayment->status,
            ];
        } catch (\Exception $e) {
            throw new \Exception('Payment verification failed: ' . $e->getMessage());
        }
    }

    private function updateBookingPaymentStatus(\App\Models\Booking $booking, Payment $payment): void'
    {
        $totalPaid = $booking->payments()
            ->where('status', 'success')
            ->sum('amount');

        $totalPaid += $payment->amount;

        if ($totalPaid >= $booking->total_price) {
            $this->bookings->update($booking, [
                'payment_status' => 'paid',
                'status' => 'confirmed',
            ]);
        } else {
            $percentage = ($totalPaid / $booking->total_price) * 100;
            if ($percentage >= 50) {
                $this->bookings->update($booking, [
                    'payment_status' => 'partial',
                ]);
            } else {
                $this->bookings->update($booking, [
                    'payment_status' => 'pending',
                ]);
            }
        }
    }
}
