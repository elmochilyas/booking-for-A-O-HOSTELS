<?php

namespace App\DTO;

readonly class ConfirmPaymentDTO
{
    public function __construct(
        public string $paymentId,
        public string $paymentIntentId,
    ) {}

    public static function fromRequest(\App\Http\Requests\Api\Payment\ConfirmPaymentRequest $request): self
    {
        return new self(
            paymentId: $request->validated('payment_id'),
            paymentIntentId: $request->validated('payment_intent_id'),
        );
    }

    public function toArray(): array
    {
        return [
            'payment_id'        => $this->paymentId,
            'payment_intent_id' => $this->paymentIntentId,
        ];
    }
}
