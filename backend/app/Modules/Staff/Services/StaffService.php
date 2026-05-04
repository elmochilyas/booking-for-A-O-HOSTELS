<?php

namespace App\Modules\Staff\Services;

use App\Models\Staff;
use Illuminate\Support\Facades\Hash;

class StaffService
{
    public function getAllStaff(?string $propertyId = null): array
    {
        $query = Staff::query();

        if ($propertyId) {
            $query->where('property_id', $propertyId);
        }

        return $query->get()->toArray();
    }

    public function getStaffById(string $id): ?Staff
    {
        return Staff::find($id);
    }

    public function createStaff(array $data): Staff
    {
        $data['password_hash'] = Hash::make($data['password']);
        unset($data['password']);

        return Staff::create($data);
    }

    public function updateStaff(Staff $staff, array $data): Staff
    {
        if (isset($data['password'])) {
            $data['password_hash'] = Hash::make($data['password']);
            unset($data['password']);
        }

        $staff->update($data);

        return $staff;
    }

    public function deleteStaff(Staff $staff): void
    {
        $staff->delete();
    }

    public function toggleActive(Staff $staff): Staff
    {
        $staff->update(['is_active' => ! $staff->is_active]);

        return $staff;
    }

    public function getStaffByProperty(string $propertyId): array
    {
        return Staff::where('property_id', $propertyId)
            ->where('is_active', true)
            ->get()
            ->toArray();
    }

    public function getReceptionStaff(string $propertyId): array
    {
        return Staff::where('property_id', $propertyId)
            ->where('role', 'reception')
            ->where('is_active', true)
            ->get()
            ->toArray();
    }
}
