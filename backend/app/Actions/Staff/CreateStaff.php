<?php

declare(strict_types=1);

namespace App\Actions\Staff;

use App\Contracts\Repositories\StaffRepositoryInterface;
use App\DTO\CreateStaffDTO;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

readonly class CreateStaff
{
    public function __construct(
        private StaffRepositoryInterface $staff,
    ) {}

    public function handle(CreateStaffDTO $dto): Staff
    {
        return $this->staff->create([
            'id' => (string) Str::uuid(),
            'email' => $dto->email,
            'password_hash' => Hash::make($dto->password),
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'role' => $dto->role->value,
            'property_id' => $dto->propertyId,
            'is_active' => true,
        ]);
    }
}
