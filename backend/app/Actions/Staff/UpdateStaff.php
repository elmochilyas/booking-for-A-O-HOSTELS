<?php

declare(strict_types=1);

namespace App\Actions\Staff;

use App\Contracts\Repositories\StaffRepositoryInterface;
use App\DTO\UpdateStaffDTO;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;

readonly class UpdateStaff
{
    public function __construct(
        private StaffRepositoryInterface $staff,
    ) {}

    public function handle(Staff $staff, UpdateStaffDTO $dto): Staff
    {
        $data = array_filter([
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'role' => $dto->role?->value,
            'property_id' => $dto->propertyId,
            'is_active' => $dto->isActive,
        ], fn ($v) => ! is_null($v));

        if ($dto->password) {
            $data['password_hash'] = Hash::make($dto->password);
        }

        return $this->staff->update($staff, $data);
    }
}
