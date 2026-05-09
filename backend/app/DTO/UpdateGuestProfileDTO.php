<?php

declare(strict_types=1);

namespace App\DTO;

use App\Http\Requests\Api\Guest\UpdateProfileRequest;

readonly class UpdateGuestProfileDTO
{
    public function __construct(
        public ?string $firstName = null,
        public ?string $lastName = null,
        public ?string $phone = null,
        public ?string $country = null,
        public ?string $dateOfBirth = null,
    ) {}

    public static function fromRequest(UpdateProfileRequest $request): self
    {
        return new self(
            firstName: $request->validated('first_name'),
            lastName: $request->validated('last_name'),
            phone: $request->validated('phone'),
            country: $request->validated('country'),
            dateOfBirth: $request->validated('date_of_birth'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            firstName: $data['first_name'] ?? null,
            lastName: $data['last_name'] ?? null,
            phone: $data['phone'] ?? null,
            country: $data['country'] ?? null,
            dateOfBirth: $data['date_of_birth'] ?? null,
        );
    }
}
