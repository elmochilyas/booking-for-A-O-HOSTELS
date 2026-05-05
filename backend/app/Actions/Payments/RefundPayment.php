<?php

namespace App\Actions\Payments;

use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Events\PaymentRefunded;
use App\Models\Payment;

readonly class RefundPayment
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
    ) {}

    public function handle(Payment $payment, array $data): Payment
    {
        if ($payment->status !== \App\Enums\PaymentStatus::COMPLETED) {
            throw new \App\Exceptions\InvalidPaymentStatusException('Only completed payments can be refunded.');
        }

        $refundedPayment = $this->payments->refund($payment, $data);

        PaymentRefunded::dispatch($refundedPayment);

        return $refundedPayment;
    }
}
