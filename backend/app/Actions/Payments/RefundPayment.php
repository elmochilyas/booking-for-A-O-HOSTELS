<?php

namespace App\Actions\Payments;

use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Enums\PaymentStatus;
use App\Events\PaymentRefunded;
use App\Exceptions\InvalidPaymentStatusException;
use App\Models\Payment;

readonly class RefundPayment
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
    ) {}

    public function handle(Payment $payment, array $data): Payment
    {
        if ($payment->status !== PaymentStatus::COMPLETED) {
            throw new InvalidPaymentStatusException('Only completed payments can be refunded.');
        }

        $refundedPayment = $this->payments->refund($payment, $data);

        PaymentRefunded::dispatch($refundedPayment);

        return $refundedPayment;
    }
}
