<?php

namespace App\Repositories;

use App\Contracts\Repositories\StaffRepositoryInterface;
use App\Models\Staff;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EloquentStaffRepository implements StaffRepositoryInterface
{
    public function find(string $id): ?Staff
    {
        return Staff::with(['property'])->find($id);
    }

    public function findOrFail(string $id): Staff
    {
        return Staff::with(['property'])->findOrFail($id);
    }

    public function create(array $data): Staff
    {
        $staff = Staff::create($data);
        return $staff->load(['property']);
    }

    public function update(Staff $staff, array $data): Staff
    {
        $staff->update($data);
        return $staff->fresh(['property']);
    }

    public function delete(Staff $staff): bool
    {
        return $staff->delete();
    }

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Staff::with(['property']);

        $query = $this->applyFilters($query, $filters);

        return $query->latest()->paginate($perPage);
    }

    public function findByEmail(string $email): ?Staff
    {
        return Staff::where('email', $email)->first();
    }

    public function getByProperty(string $propertyId): LengthAwarePaginator
    {
        return Staff::where('property_id', $propertyId)
            ->latest()
            ->paginate(15);
    }

    public function updateLastLogin(Staff $staff): void
    {
        $staff->update(['last_login_at' => now()]);
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['role'] ?? null, fn($q, $v) => $q->where('role', $v))
            ->when($filters['property_id'] ?? null, fn($q, $v) => $q->where('property_id', $v))
            ->when($filters['is_active'] ?? null, fn($q, $v) => $q->where('is_active', $v))
            ->when($filters['search'] ?? null, fn($q, $v) => $q->where(function ($query) use ($v) {
                $query->where('first_name', 'like', "%{$v}%")
                    ->orWhere('last_name', 'like', "%{$v}%")
                    ->orWhere('email', 'like', "%{$v}%");
            }));
    }
}
