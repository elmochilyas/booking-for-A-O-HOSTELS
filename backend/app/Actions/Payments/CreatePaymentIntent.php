<?php

declare(strict_types=1);

namespace App\Actions\Payments;

use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Exceptions\InvalidBookingStatusException;
use App\Models\Booking;
use App\Services\StripeService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

readonly class CreatePaymentIntent
{
    public function __construct(
        private StripeService $stripeService,
        private PaymentRepositoryInterface $payments,
    ) {}

    public function handle(string $bookingId, float $amount, string $paymentMethod, int $depositPercentage = 100): array
    {
        $lock = Cache::lock("payment_intent:{$bookingId}", 10);

        return $lock->block(5, function () use ($bookingId, $amount, $paymentMethod, $depositPercentage) {
            $booking = Booking::findOrFail($bookingId);

            if ($booking->status === 'cancelled') {
                throw new InvalidBookingStatusException('Cannot pay for a cancelled booking');
            }

            $finalAmount = $amount ?? ($booking->total_price * $depositPercentage / 100);

            try {
                $paymentIntent = $this->stripeService->createPaymentIntent(
                    $finalAmount,
                    config('payments.currency', 'eur'),
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
                    'currency' => config('payments.currency', 'eur'),
                ];
            } catch (\Exception $e) {
                throw new \Exception('Failed to create payment intent: '.$e->getMessage());
            }
        });

        return ['success' => false, 'message' => 'Payment intent creation timed out'];
    }
}
