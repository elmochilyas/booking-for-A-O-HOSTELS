<?php

namespace App\Contracts\Repositories;

use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PropertyRepositoryInterface
{
    public function find(string $id): ?Property;

    public function findOrFail(string $id): Property;

    public function create(array $data): Property;

    public function update(Property $property, array $data): Property;

    public function delete(Property $property): bool;

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function findByCity(string $city): LengthAwarePaginator;

    public function findByStatus(string $status): LengthAwarePaginator;

    public function search(string $query, array $filters = []): LengthAwarePaginator;

    public function getWithAvailability(string $checkIn, string $checkOut): array;
}
