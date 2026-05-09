<?php

declare(strict_types=1);

namespace App\Modules\Payments\Controllers;

use App\Actions\Payments\HandlePaymentFailed;
use App\Actions\Payments\HandlePaymentSucceeded;
use App\Actions\Payments\HandleRefund as HandleRefundAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

#[Middleware('throttle:60,1')]
class WebhookController extends Controller
{
    public function __construct(
        private HandlePaymentSucceeded $handlePaymentSucceeded,
        private HandlePaymentFailed $handlePaymentFailed,
        private HandleRefundAction $handleRefund,
    ) {}

    public function handleStripeWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('stripe-signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        match ($event->type) {
            'payment_intent.succeeded' => $this->handlePaymentSucceeded->handle($event->data->object),
            'payment_intent.payment_failed' => $this->handlePaymentFailed->handle($event->data->object),
            'charge.refunded' => $this->handleRefund->handle($event->data->object),
            default => Log::info("Unhandled event type: {$event->type}"),
        };

        return response()->json(['received' => true]);
    }
}
