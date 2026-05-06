<?php

namespace App\DTO;

use App\Enums\StaffRole;
use App\Http\Requests\Api\Staff\CreateStaffRequest;

readonly class CreateStaffDTO
{
    public function __construct(
        public string $email,
        public string $password,
        public string $firstName,
        public string $lastName,
        public StaffRole $role,
        public ?string $propertyId = null,
    ) {}

    public static function fromRequest(CreateStaffRequest $request): self
    {
        return new self(
            email: $request->validated('email'),
            password: $request->validated('password'),
            firstName: $request->validated('first_name'),
            lastName: $request->validated('last_name'),
            role: StaffRole::from($request->validated('role')),
            propertyId: $request->validated('property_id'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            email: $data['email'] ?? '',
            password: $data['password'] ?? '',
            firstName: $data['first_name'] ?? '',
            lastName: $data['last_name'] ?? '',
            role: isset($data['role']) ? StaffRole::from($data['role']) : StaffRole::STAFF,
            propertyId: $data['property_id'] ?? null,
        );
    }
}
