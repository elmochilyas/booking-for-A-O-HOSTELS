<?php

namespace App\DTO;

use App\Enums\PaymentMethod;

readonly class CreatePaymentDTO
{
    public function __construct(
        public string           $bookingId,
        public float            $amount,
        public PaymentMethod    $paymentMethod,
        public ?array           $paymentDetails = null,
    ) {}

    public static function fromRequest(\App\Http\Requests\Api\Payment\CreatePaymentRequest $request): self
    {
        return new self(
            bookingId: $request->validated('booking_id'),
            amount: (float) $request->validated('amount'),
            paymentMethod: PaymentMethod::from($request->validated('payment_method')),
            paymentDetails: $request->validated('payment_details'),
        );
    }

    public function toArray(): array
    {
        return [
            'booking_id'     => $this->bookingId,
            'amount'          => $this->amount,
            'payment_method'  => $this->paymentMethod->value,
            'payment_details' => $this->paymentDetails,
        ];
    }
}
