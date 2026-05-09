<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Contracts\Repositories\StaffRepositoryInterface;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

readonly class CreateStaffAction
{
    public function __construct(
        private StaffRepositoryInterface $staffRepository,
    ) {}

    public function handle(array $data): Staff
    {
        $staff = $this->staffRepository->create([
            'id' => Str::uuid()->toString(),
            'email' => $data['email'],
            'password_hash' => Hash::make($data['password']),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'role' => $data['role'] ?? 'staff',
            'property_id' => $data['property_id'] ?? null,
            'admin_role_id' => $data['admin_role_id'] ?? null,
            'permissions' => $data['permissions'] ?? null,
            'assigned_properties' => $data['assigned_properties'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'two_factor_enabled' => $data['two_factor_enabled'] ?? false,
        ]);

        return $staff;
    }
}
