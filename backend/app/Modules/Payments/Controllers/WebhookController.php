<?php

namespace App\Modules\Payments\Controllers;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class WebhookController
{
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

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentSuccess($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($event->data->object);
                break;

            case 'charge.refunded':
                $this->handleRefund($event->data->object);
                break;

            default:
                \Log::info("Unhandled event type: {$event->type}");
        }

        return response()->json(['received' => true]);
    }

    private function handlePaymentSuccess($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_id', $paymentIntent->id)->first();

        if ($payment) {
            $payment->update(['status' => 'success']);

            $booking = Booking::find($payment->booking_id);
            if ($booking) {
                $totalPaid = Payment::where('booking_id', $booking->id)
                    ->where('status', 'success')
                    ->sum('amount');

                if ($totalPaid >= $booking->total_price) {
                    $booking->update(['payment_status' => 'paid', 'status' => 'confirmed']);
                } else {
                    $booking->update(['payment_status' => 'partial']);
                }
            }
        }
    }

    private function handlePaymentFailed($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_id', $paymentIntent->id)->first();

        if ($payment) {
            $payment->update(['status' => 'failed']);
        }
    }

    private function handleRefund($charge): void
    {
        if ($charge->payment_intent) {
            $payment = Payment::where('stripe_payment_id', $charge->payment_intent)->first();

            if ($payment) {
                $payment->update(['status' => 'refunded']);
            }
        }
    }
}