<?php

declare(strict_types=1);

namespace App\Contracts\Repositories;

use App\Models\Staff;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface StaffRepositoryInterface
{
    public function find(string $id): ?Staff;

    public function findOrFail(string $id): Staff;

    public function create(array $data): Staff;

    public function update(Staff $staff, array $data): Staff;

    public function delete(Staff $staff): bool;

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function findByEmail(string $email): ?Staff;

    public function getByProperty(string $propertyId): LengthAwarePaginator;

    public function updateLastLogin(Staff $staff): void;
}
