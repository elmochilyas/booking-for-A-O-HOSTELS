<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\EmailService;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(
        private StripeService $stripeService,
        private EmailService $emailService
    ) {}

    public function createIntent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|uuid|exists:bookings,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|in:card,paypal,bank_transfer',
            'deposit_percentage' => 'nullable|integer|min:20|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $booking = Booking::find($request->booking_id);

        if ($booking->status === 'cancelled') {
            return response()->json(['error' => 'Cannot pay for a cancelled booking'], 400);
        }

        $depositPercentage = $request->deposit_percentage ?? 100;
        $amount = $request->amount ?? ($booking->total_price * $depositPercentage / 100);

        try {
            $paymentIntent = $this->stripeService->createPaymentIntent(
                $amount,
                'eur',
                [
                    'booking_id' => $booking->id,
                    'guest_id' => $booking->guest_id,
                ]
            );

            $payment = Payment::create([
                'id' => Str::uuid()->toString(),
                'booking_id' => $booking->id,
                'amount' => $amount,
                'payment_method' => $request->payment_method ?? 'card',
                'status' => 'pending',
                'stripe_payment_id' => $paymentIntent->id,
                'stripe_client_secret' => $paymentIntent->client_secret,
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_id' => $payment->id,
                'amount' => $amount,
                'currency' => 'eur',
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create payment intent: '.$e->getMessage()], 500);
        }
    }

    public function confirmPayment(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'payment_id' => 'required|uuid|exists:payments,id',
            'payment_intent_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::find($request->payment_id);

        if ($payment->stripe_payment_id !== $request->payment_intent_id) {
            return response()->json(['error' => 'Payment intent mismatch'], 400);
        }

        try {
            $stripePayment = $this->stripeService->retrievePayment($request->payment_intent_id);

            if ($stripePayment->status === 'succeeded') {
                $payment->update(['status' => 'success']);

                $booking = $payment->booking;
                $this->updateBookingPaymentStatus($booking, $payment);

                $this->emailService->sendPaymentConfirmation($booking, $payment);

                return response()->json([
                    'message' => 'Payment successful',
                    'payment' => $payment,
                ]);
            }

            return response()->json([
                'error' => 'Payment not completed',
                'stripe_status' => $stripePayment->status,
            ], 400);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Payment verification failed'], 500);
        }
    }

    public function refund(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|uuid|exists:bookings,id',
            'amount' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $booking = Booking::find($request->booking_id);
        $successfulPayment = $booking->payments()
            ->where('status', 'success')
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $successfulPayment) {
            return response()->json(['error' => 'No successful payment found'], 400);
        }

        $refundAmount = $request->amount ?? $successfulPayment->amount;

        try {
            $refund = $this->stripeService->createRefund(
                $successfulPayment->stripe_payment_id,
                $refundAmount
            );

            $payment = Payment::create([
                'id' => Str::uuid()->toString(),
                'booking_id' => $booking->id,
                'amount' => -$refundAmount,
                'payment_method' => $successfulPayment->payment_method,
                'status' => 'refunded',
                'stripe_payment_id' => $refund->id,
                'notes' => $request->reason ?? 'Refund processed',
            ]);

            $booking->update(['payment_status' => 'refunded']);

            $this->emailService->sendRefundConfirmation($booking, $refundAmount);

            return response()->json([
                'message' => 'Refund processed successfully',
                'refund' => $refund,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Refund failed: '.$e->getMessage()], 500);
        }
    }

    public function bookingPayments(string $bookingId): JsonResponse
    {
        $booking = Booking::with('payments')->find($bookingId);

        if (! $booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json([
            'payments' => $booking->payments,
            'total_paid' => $booking->payments()->where('status', 'success')->sum('amount'),
        ]);
    }

    private function updateBookingPaymentStatus(Booking $booking, Payment $payment): void
    {
        $totalPaid = $booking->payments()
            ->where('status', 'success')
            ->sum('amount');

        $booking->load('payments');
        $totalPaid += $payment->amount;

        if ($totalPaid >= $booking->total_price) {
            $booking->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
            ]);
        } else {
            $percentage = ($totalPaid / $booking->total_price) * 100;
            if ($percentage >= 50) {
                $booking->update(['payment_status' => 'partial']);
            } else {
                $booking->update(['payment_status' => 'pending']);
            }
        }
    }
}
