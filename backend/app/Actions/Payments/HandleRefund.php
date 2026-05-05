<?php

namespace App\Actions\Payments;

use App\Models\Payment;

readonly class HandleRefund
{
    public function handle(string $stripePaymentIntentId): void
    {
        $payment = Payment::where('stripe_payment_id', $stripePaymentIntentId)->first();

        if (! $payment) {
            return;
        }

        $payment->update(['status' => 'refunded']);
    }
}
