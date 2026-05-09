<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Contracts\Repositories\StaffRepositoryInterface;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;

readonly class UpdateStaffAction
{
    public function __construct(
        private StaffRepositoryInterface $staffRepository,
    ) {}

    public function handle(Staff $staff, array $data): Staff
    {
        $updateData = [];

        if (isset($data['first_name'])) {
            $updateData['first_name'] = $data['first_name'];
        }
        if (isset($data['last_name'])) {
            $updateData['last_name'] = $data['last_name'];
        }
        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }
        if (isset($data['password'])) {
            $updateData['password_hash'] = Hash::make($data['password']);
        }
        if (isset($data['role'])) {
            $updateData['role'] = $data['role'];
        }
        if (array_key_exists('property_id', $data)) {
            $updateData['property_id'] = $data['property_id'];
        }
        if (array_key_exists('admin_role_id', $data)) {
            $updateData['admin_role_id'] = $data['admin_role_id'];
        }
        if (array_key_exists('permissions', $data)) {
            $updateData['permissions'] = $data['permissions'];
        }
        if (array_key_exists('assigned_properties', $data)) {
            $updateData['assigned_properties'] = $data['assigned_properties'];
        }
        if (array_key_exists('is_active', $data)) {
            $updateData['is_active'] = $data['is_active'];
        }
        if (array_key_exists('two_factor_enabled', $data)) {
            $updateData['two_factor_enabled'] = $data['two_factor_enabled'];
        }

        return $this->staffRepository->update($staff, $updateData);
    }
}
