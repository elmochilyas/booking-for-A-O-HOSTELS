<?php

namespace App\Actions\Payments;

use App\Models\Payment;

readonly class HandlePaymentFailed
{
    public function handle(string $stripePaymentId, ?string $failureMessage = null): void
    {
        $payment = Payment::where('stripe_payment_id', $stripePaymentId)->first();

        if (! $payment) {
            return;
        }

        $payment->update([
            'status' => 'failed',
            'failure_message' => $failureMessage,
        ]);
    }
}
