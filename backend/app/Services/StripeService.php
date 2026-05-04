<?php

namespace App\Services;

use Exception;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\StripeClient;

class StripeService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(env('STRIPE_SECRET'));
    }

    public function createPaymentIntent(float $amount, string $currency = 'eur', array $metadata = []): PaymentIntent
    {
        try {
            return $this->stripe->paymentIntents->create([
                'amount' => (int) ($amount * 100),
                'currency' => $currency,
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);
        } catch (Exception $e) {
            throw new Exception('Failed to create payment intent: '.$e->getMessage());
        }
    }

    public function retrievePayment(string $paymentIntentId): PaymentIntent
    {
        try {
            return $this->stripe->paymentIntents->retrieve($paymentIntentId);
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve payment: '.$e->getMessage());
        }
    }

    public function createRefund(string $paymentIntentId, ?float $amount = null): Refund
    {
        try {
            $params = ['payment_intent' => $paymentIntentId];

            if ($amount !== null) {
                $params['amount'] = (int) ($amount * 100);
            }

            return $this->stripe->refunds->create($params);
        } catch (Exception $e) {
            throw new Exception('Failed to create refund: '.$e->getMessage());
        }
    }

    public function constructWebhookEvent(string $payload, string $signature): object
    {
        $webhookSecret = env('STRIPE_WEBHOOK_SECRET');

        try {
            return $this->stripe->webhooks->constructEvent(
                $payload,
                $signature,
                $webhookSecret
            );
        } catch (Exception $e) {
            throw new Exception('Webhook signature verification failed: '.$e->getMessage());
        }
    }
}
