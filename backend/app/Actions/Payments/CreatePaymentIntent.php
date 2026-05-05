<?php

namespace App\Actions\Payments;

use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Exceptions\InvalidBookingStatusException;
use App\Models\Booking;
use App\Services\StripeService;
use Illuminate\Support\Str;

readonly class CreatePaymentIntent
{
    public function __construct(
        private StripeService $stripeService,
        private PaymentRepositoryInterface $payments,
    ) {}

    public function handle(string $bookingId, float $amount, string $paymentMethod, int $depositPercentage = 100): array
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->status === 'cancelled') {
            throw new InvalidBookingStatusException('Cannot pay for a cancelled booking');
        }

        $finalAmount = $amount ?? ($booking->total_price * $depositPercentage / 100);

        try {
            $paymentIntent = $this->stripeService->createPaymentIntent(
                $finalAmount,
                'eur',
                [
                    'booking_id' => $booking->id,
                    'guest_id' => $booking->guest_id,
                ]
            );

            $payment = $this->payments->create([
                'id' => (string) Str::uuid(),
                'booking_id' => $booking->id,
                'amount' => $finalAmount,
                'payment_method' => $paymentMethod,
                'status' => 'pending',
                'stripe_payment_id' => $paymentIntent->id,
                'stripe_client_secret' => $paymentIntent->client_secret,
            ]);

            return [
                'client_secret' => $paymentIntent->client_secret,
                'payment_id' => $payment->id,
                'amount' => $finalAmount,
                'currency' => 'eur',
            ];
        } catch (\Exception $e) {
            throw new \Exception('Failed to create payment intent: '.$e->getMessage());
        }
    }
}
