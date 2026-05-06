<?php

namespace App\Actions\Payments;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Events\PaymentRefunded;
use App\Services\EmailService;
use App\Services\StripeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

readonly class RefundPayment
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
        private BookingRepositoryInterface $bookings,
        private StripeService $stripeService,
        private EmailService $emailService,
    ) {}

    public function handle(string $bookingId, ?float $amount = null, ?string $reason = null): array
    {
        return DB::transaction(function () use ($bookingId, $amount, $reason) {
            $booking = $this->bookings->findOrFail($bookingId);
            $successfulPayment = $booking->payments()->where('status', 'completed')->first();

            if (! $successfulPayment) {
                throw new \Exception('No successful payment found for this booking');
            }

            $refundAmount = $amount ?? $successfulPayment->amount;
            $stripeRefund = $this->stripeService->refundPayment($successfulPayment->stripe_payment_id, $refundAmount, $reason);

            $refundPayment = $this->payments->create([
                'id' => (string) Str::uuid(),
                'booking_id' => $bookingId,
                'amount' => -$refundAmount,
                'payment_method' => $successfulPayment->payment_method,
                'status' => 'refunded',
                'stripe_payment_id' => $stripeRefund->id,
            ]);

            $totalPaid = $booking->payments()->where('status', 'completed')->sum('amount');
            $this->bookings->update($booking, ['payment_status' => $totalPaid > 0 ? 'partial' : 'pending']);

            PaymentRefunded::dispatch($booking, $refundAmount);

            return [
                'refund_id' => $refundPayment->id,
                'amount' => $refundAmount,
                'status' => 'success',
            ];
        });
    }
}
