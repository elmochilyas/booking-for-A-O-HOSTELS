<?php

declare(strict_types=1);

namespace App\DTO;

use App\Enums\BookingStatus;
use App\Http\Requests\Api\Booking\UpdateBookingRequest;
use Carbon\Carbon;

readonly class UpdateBookingDTO
{
    public function __construct(
        public ?Carbon $checkInDate = null,
        public ?Carbon $checkOutDate = null,
        public ?int $guestCount = null,
        public ?string $specialRequests = null,
        public ?BookingStatus $status = null,
    ) {}

    public static function fromRequest(UpdateBookingRequest $request): self
    {
        return new self(
            checkInDate: $request->validated('check_in_date') ? new Carbon($request->validated('check_in_date')) : null,
            checkOutDate: $request->validated('check_out_date') ? new Carbon($request->validated('check_out_date')) : null,
            guestCount: $request->validated('guest_count'),
            specialRequests: $request->validated('special_requests'),
            status: $request->validated('status') ? BookingStatus::from($request->validated('status')) : null,
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            checkInDate: isset($data['check_in_date']) ? new Carbon($data['check_in_date']) : null,
            checkOutDate: isset($data['check_out_date']) ? new Carbon($data['check_out_date']) : null,
            guestCount: $data['guest_count'] ?? null,
            specialRequests: $data['special_requests'] ?? null,
            status: isset($data['status']) ? BookingStatus::from($data['status']) : null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'check_in_date' => $this->checkInDate?->toDateString(),
            'check_out_date' => $this->checkOutDate?->toDateString(),
            'guest_count' => $this->guestCount,
            'special_requests' => $this->specialRequests,
            'status' => $this->status?->value,
        ], fn ($value) => ! is_null($value));
    }
}
