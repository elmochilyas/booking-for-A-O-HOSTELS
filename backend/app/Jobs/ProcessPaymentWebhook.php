<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Actions\Payments\HandlePaymentFailed;
use App\Actions\Payments\HandlePaymentSucceeded;
use App\Actions\Payments\HandleRefund;
use App\Services\StripeService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Queueable;
use Illuminate\Support\Facades\Log;

#[Tries(5)]
#[Backoff([10, 30, 60, 120, 300])]
#[Timeout(60)]
class ProcessPaymentWebhook implements ShouldQueue
{
    use InteractsWithQueue, Queueable;

    public function __construct(
        private string $payload,
        private string $sigHeader,
    ) {}

    public function handle(StripeService $stripeService): void
    {
        try {
            $event = $stripeService->constructWebhookEvent($this->payload, $this->sigHeader);
        } catch (\Exception $e) {
            Log::error('Stripe webhook signature verification failed: '.$e->getMessage());

            return;
        }

        match ($event->type) {
            'payment_intent.succeeded' => app(HandlePaymentSucceeded::class)->handle(
                $event->data->object->id
            ),
            'payment_intent.payment_failed' => app(HandlePaymentFailed::class)->handle(
                $event->data->object->id,
                $event->data->object->last_payment_error->message ?? null
            ),
            'charge.refunded' => app(HandleRefund::class)->handle(
                $event->data->object->payment_intent
            ),
            default => Log::info('Unhandled Stripe event type: '.$event->type),
        };
    }

    public function failed(\Throwable $e): void
    {
        Log::critical('Payment webhook processing failed', [
            'error' => $e->getMessage(),
            'payload' => $this->payload,
        ]);
    }
}
