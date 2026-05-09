<?php

declare(strict_types=1);

namespace App\DTO;

use App\Enums\StaffRole;
use App\Http\Requests\Api\Staff\UpdateStaffRequest;

readonly class UpdateStaffDTO
{
    public function __construct(
        public ?string $firstName = null,
        public ?string $lastName = null,
        public ?StaffRole $role = null,
        public ?string $propertyId = null,
        public ?bool $isActive = null,
        public ?string $password = null,
    ) {}

    public static function fromRequest(UpdateStaffRequest $request): self
    {
        return new self(
            firstName: $request->validated('first_name'),
            lastName: $request->validated('last_name'),
            role: $request->validated('role') ? StaffRole::from($request->validated('role')) : null,
            propertyId: $request->validated('property_id'),
            isActive: $request->validated('is_active'),
            password: $request->validated('password'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            firstName: $data['first_name'] ?? null,
            lastName: $data['last_name'] ?? null,
            role: isset($data['role']) ? StaffRole::from($data['role']) : null,
            propertyId: $data['property_id'] ?? null,
            isActive: $data['is_active'] ?? null,
            password: $data['password'] ?? null,
        );
    }
}
