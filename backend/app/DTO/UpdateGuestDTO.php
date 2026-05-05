<?php

namespace App\DTO;

use App\Http\Requests\Api\Guest\UpdateProfileRequest;

readonly class UpdateGuestDTO
{
    public function __construct(
        public ?string $firstName = null,
        public ?string $lastName = null,
        public ?string $phone = null,
        public ?string $dateOfBirth = null,
        public ?array $preferences = null,
    ) {}

    public static function fromRequest(UpdateProfileRequest $request): self
    {
        return new self(
            firstName: $request->validated('first_name'),
            lastName: $request->validated('last_name'),
            phone: $request->validated('phone'),
            dateOfBirth: $request->validated('date_of_birth'),
            preferences: $request->validated('preferences'),
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'phone' => $this->phone,
            'date_of_birth' => $this->dateOfBirth,
            'preferences' => $this->preferences,
        ], fn ($value) => ! is_null($value));
    }
}
