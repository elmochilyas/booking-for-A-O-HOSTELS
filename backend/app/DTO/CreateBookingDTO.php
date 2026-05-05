<?php

namespace App\DTO;

use App\Enums\BookingSource;
use App\Enums\PaymentMethod;
use App\Http\Requests\Api\Booking\CreateBookingRequest;
use Carbon\Carbon;

readonly class CreateBookingDTO
{
    public function __construct(
        public string $propertyId,
        public string $roomTypeId,
        public string $guestId,
        public Carbon $checkInDate,
        public Carbon $checkOutDate,
        public int $guestCount,
        public ?PaymentMethod $paymentMethod = null,
        public ?BookingSource $source = null,
        public ?string $specialRequests = null,
        public array $extras = [],
        public ?array $guestDetails = null,
    ) {}

    public static function fromRequest(CreateBookingRequest $request): self
    {
        return new self(
            propertyId: $request->validated('property_id'),
            roomTypeId: $request->validated('room_type_id'),
            guestId: $request->user()->id,
            checkInDate: new Carbon($request->validated('check_in_date')),
            checkOutDate: new Carbon($request->validated('check_out_date')),
            guestCount: $request->validated('guest_count'),
            paymentMethod: $request->validated('payment_method') ? PaymentMethod::from($request->validated('payment_method')) : null,
            source: $request->validated('source') ? BookingSource::from($request->validated('source')) : null,
            specialRequests: $request->validated('special_requests'),
            extras: $request->validated('extras', []),
            guestDetails: $request->validated('guest_details'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            propertyId: $data['property_id'],
            roomTypeId: $data['room_type_id'],
            guestId: $data['guest_id'],
            checkInDate: new Carbon($data['check_in_date']),
            checkOutDate: new Carbon($data['check_out_date']),
            guestCount: $data['guest_count'],
            paymentMethod: PaymentMethod::from($data['payment_method']),
            source: isset($data['source']) ? BookingSource::from($data['source']) : null,
            specialRequests: $data['special_requests'] ?? null,
            extras: $data['extras'] ?? [],
            guestDetails: $data['guest_details'] ?? null,
        );
    }

    public function getNights(): int
    {
        return $this->checkInDate->diffInDays($this->checkOutDate);
    }
}
