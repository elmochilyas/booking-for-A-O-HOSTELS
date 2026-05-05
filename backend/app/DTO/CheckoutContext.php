<?php

namespace App\DTO;

use App\Enums\PaymentMethod;

class CheckoutContext
{
    public float $subtotal = 0.0;

    public float $discount = 0.0;

    public float $tax = 0.0;

    public float $total = 0.0;

    public ?string $couponCode = null;

    public ?string $errorMessage = null;

    public function __construct(
        public string $bookingId,
        public string $propertyId,
        public string $roomTypeId,
        public int $guestCount,
        public PaymentMethod $paymentMethod,
        public string $shippingAddress,
    ) {}

    public static function fromDTO(CreateBookingDTO $dto): self
    {
        return new self(
            bookingId: $dto->propertyId, // This should be booking ID after creation
            propertyId: $dto->propertyId,
            roomTypeId: $dto->roomTypeId,
            guestCount: $dto->guestCount,
            paymentMethod: $dto->paymentMethod,
            shippingAddress: '', // To be filled
        );
    }

    public function hasError(): bool
    {
        return ! is_null($this->errorMessage);
    }

    public function calculateTotal(): void
    {
        $this->total = $this->subtotal - $this->discount + $this->tax;
    }
}
