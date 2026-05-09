<?php

declare(strict_types=1);

namespace App\DTO;

use App\Enums\PaymentMethod;

readonly class CheckoutContext
{
    public float $subtotal;

    public float $discount;

    public float $tax;

    public ?string $couponCode;

    public ?string $errorMessage;

    public function __construct(
        public string $bookingId,
        public string $propertyId,
        public string $roomTypeId,
        public int $guestCount,
        public PaymentMethod $paymentMethod,
        public string $shippingAddress,
    ) {
        $this->subtotal = 0.0;
        $this->discount = 0.0;
        $this->tax = 0.0;
        $this->couponCode = null;
        $this->errorMessage = null;
    }

    public static function fromDTO(CreateBookingDTO $dto): self
    {
        return new self(
            bookingId: $dto->bookingId ?? '',
            propertyId: $dto->propertyId,
            roomTypeId: $dto->roomTypeId,
            guestCount: $dto->guestCount,
            paymentMethod: $dto->paymentMethod,
            shippingAddress: '',
        );
    }

    public function hasError(): bool
    {
        return ! is_null($this->errorMessage);
    }

    public function calculateTotal(): float
    {
        return $this->subtotal - $this->discount + $this->tax;
    }
}
