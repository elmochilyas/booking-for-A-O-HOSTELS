<?php

namespace App\Actions\Payments;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\DTO\ConfirmPaymentDTO;
use App\Events\PaymentProcessed;
use App\Services\EmailService;
use App\Services\StripeService;

readonly class ConfirmPayment
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
        private BookingRepositoryInterface $bookings,
        private StripeService $stripeService,
        private EmailService $emailService,
    ) {}

    public function handle(ConfirmPaymentDTO $dto): array
    {
        $payment = $this->payments->findOrFail($dto->paymentId);

        if ($payment->stripe_payment_id !== $dto->paymentIntentId) {
            throw new \Exception('Payment intent mismatch');
        }

        try {
            $stripePayment = $this->stripeService->confirmPaymentIntent($dto->paymentIntentId);

            if ($stripePayment->status === 'succeeded') {
                $payment->update(['status' => 'completed']);

                $booking = $this->bookings->findOrFail($payment->booking_id);
                $totalPaid = $booking->payments()->where('status', 'completed')->sum('amount');

                if ($totalPaid >= $booking->total_price) {
                    $booking->update([
                        'payment_status' => 'paid',
                        'status' => $booking->status === 'pending' ? 'confirmed' : $booking->status,
                    ]);
                }

                PaymentProcessed::dispatch($booking);
            } elseif ($stripePayment->status === 'requires_action') {
                return [
                    'requires_action' => true,
                    'client_secret' => $stripePayment->client_secret,
                ];
            } else {
                $payment->update(['status' => 'failed']);
                throw new \Exception('Payment failed: '.$stripePayment->last_payment_error->message ?? 'Unknown error');
            }

            return [
                'status' => $payment->status,
                'booking_id' => $payment->booking_id,
            ];
        } catch (\Exception $e) {
            $payment->update(['status' => 'failed']);
            throw $e;
        }
    }
}
