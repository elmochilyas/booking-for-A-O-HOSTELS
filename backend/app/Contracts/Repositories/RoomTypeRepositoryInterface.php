<?php

declare(strict_types=1);

namespace App\Contracts\Repositories;

use App\Models\RoomType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface RoomTypeRepositoryInterface
{
    public function find(string $id): ?RoomType;

    public function findOrFail(string $id): RoomType;

    public function getByProperty(string $propertyId): array;

    public function create(array $data): RoomType;

    public function update(RoomType $roomType, array $data): RoomType;

    public function delete(RoomType $roomType): bool;

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function getWithCount(string $withCount, ?string $propertyId = null): Collection;
}
