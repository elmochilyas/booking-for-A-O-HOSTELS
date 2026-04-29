<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function __construct(
        private StripeService $stripeService
    ) {}

    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('stripe-signature');
        
        try {
            $event = $this->stripeService->constructWebhookEvent($payload, $sigHeader);
        } catch (\Exception $e) {
            Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        match ($event->type) {
            'payment_intent.succeeded' => $this->handlePaymentSucceeded($event),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event),
            'charge.refunded' => $this->handleRefund($event),
            default => Log::info('Unhandled Stripe event type: ' . $event->type),
        };

        return response()->json(['received' => true]);
    }

    private function handlePaymentSucceeded($event): void
    {
        $paymentIntent = $event->data->object;
        
        $payment = Payment::where('stripe_payment_id', $paymentIntent->id)->first();
        
        if ($payment) {
            $payment->update(['status' => 'success']);
            
            $booking = $payment->booking;
            $this->updateBookingPaymentStatus($booking, $payment);
        }
    }

    private function handlePaymentFailed($event): void
    {
        $paymentIntent = $event->data->object;
        
        $payment = Payment::where('stripe_payment_id', $paymentIntent->id)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'failure_message' => $paymentIntent->last_payment_error->message ?? null,
            ]);
        }
    }

    private function handleRefund($event): void
    {
        $charge = $event->data->object;
        
        $payment = Payment::where('stripe_payment_id', $charge->payment_intent)->first();
        
        if ($payment) {
            $payment->update(['status' => 'refunded']);
        }
    }

    private function updateBookingPaymentStatus(Booking $booking, Payment $payment): void
    {
        $totalPaid = $booking->payments()
            ->where('status', 'success')
            ->sum('amount');

        $booking->load('payments');
        
        if ($totalPaid >= $booking->total_price) {
            $booking->update([
                'payment_status' => 'paid',
                'status' => $booking->status === 'pending' ? 'confirmed' : $booking->status,
            ]);
        } elseif ($totalPaid > 0) {
            $percentage = ($totalPaid / $booking->total_price) * 100;
            $booking->update(['payment_status' => $percentage >= 50 ? 'partial' : 'pending']);
        }
    }
}