<?php

namespace App\Actions\Payments;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Events\PaymentRefunded;
use Illuminate\Support\Facades\DB;

readonly class RefundPayment'
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
        private BookingRepositoryInterface $bookings,
        private \App\Services\StripeService $stripeService,
        private \App\Services\EmailService $emailService,
    ) {}

    public function handle(string $bookingId, ?float $amount = null, ?string $reason = null): array'
    {
        $booking = $this->bookings->findOrFail($bookingId);

        $successfulPayment = $booking->payments()
            ->where('status', 'success')
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $successfulPayment) {
            throw new \Exception('No successful payment found');
        }

        $refundAmount = $amount ?? $successfulPayment->amount;

        try {
            $refund = $this->stripeService->createRefund(
                $successfulPayment->stripe_payment_id,
                $refundAmount
            );

            $refundPayment = $this->payments->create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'booking_id' => $booking->id,
                'amount' => -$refundAmount,
                'payment_method' => $successfulPayment->payment_method,
                'status' => 'refunded',
                'stripe_payment_id' => $refund->id,
                'notes' => $reason ?? 'Refund processed',
            ]);

            $booking->update(['payment_status' => 'refunded']);

            $this->emailService->sendRefundConfirmation($booking, $refundAmount);

            PaymentRefunded::dispatch($refundPayment);

            return [
                'message' => 'Refund processed successfully',
                'refund' => $refundPayment,
            ];
        } catch (\Exception $e) {
            throw new \Exception('Refund failed: ' . $e->getMessage());
        }
    }
}
