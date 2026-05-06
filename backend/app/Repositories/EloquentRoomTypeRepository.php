<?php

namespace App\Repositories;

use App\Contracts\Repositories\RoomTypeRepositoryInterface;
use App\Models\RoomType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class EloquentRoomTypeRepository implements RoomTypeRepositoryInterface
{
    public function find(string $id): ?RoomType
    {
        return Cache::tags(['room_types', "room_type:{$id}"])->remember(
            "room_type:{$id}",
            3600,
            fn () => RoomType::with(['property'])->find($id)
        );
    }

    public function findOrFail(string $id): RoomType
    {
        return Cache::tags(['room_types', "room_type:{$id}"])->remember(
            "room_type:{$id}",
            3600,
            fn () => RoomType::with(['property'])->findOrFail($id)
        );
    }

    public function getByProperty(string $propertyId): array
    {
        return Cache::tags(['room_types'])->remember(
            "room_types:property:{$propertyId}",
            3600,
            fn () => RoomType::where('property_id', $propertyId)->with(['rooms'])->get()->toArray()
        );
    }

    public function create(array $data): RoomType
    {
        $roomType = RoomType::create($data);
        Cache::tags(['room_types'])->flush();

        return $roomType->load(['property']);
    }

    public function update(RoomType $roomType, array $data): RoomType
    {
        $roomType->update($data);
        Cache::tags(['room_types', "room_type:{$roomType->id}"])->flush();

        return $roomType->fresh(['property']);
    }

    public function delete(RoomType $roomType): bool
    {
        $result = $roomType->delete();
        Cache::tags(['room_types', "room_type:{$roomType->id}"])->flush();

        return $result;
    }

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = RoomType::withCount('rooms');

        $query = $this->applyFilters($query, $filters);

        return $query->orderBy('name')->paginate($perPage);
    }

    public function getWithCount(string $withCount, ?string $propertyId = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = RoomType::withCount($withCount);

        if ($propertyId) {
            $query->where('property_id', $propertyId);
        }

        return $query->orderBy('name')->get();
    }

    private function applyFilters($query, $filters): mixed
    {
        return $query
            ->when($filters['name'] ?? null, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->when($filters['property_id'] ?? null, fn ($q, $v) => $q->where('property_id', $v));
    }
}
