<?php

namespace App\Repositories;

use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Models\Room;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EloquentRoomRepository implements RoomRepositoryInterface
{
    public function find(string $id): ?Room
    {
        return Room::with(['roomType', 'property'])->find($id);
    }

    public function findOrFail(string $id): Room
    {
        return Room::with(['roomType', 'property'])->findOrFail($id);
    }

    public function create(array $data): Room
    {
        $room = Room::create($data);

        return $room->load(['roomType', 'property']);
    }

    public function update(Room $room, array $data): Room
    {
        $room->update($data);

        return $room->fresh(['roomType', 'property']);
    }

    public function delete(Room $room): bool
    {
        return $room->delete();
    }

    public function getByProperty(string $propertyId, array $filters = []): LengthAwarePaginator
    {
        $query = Room::with(['roomType'])
            ->where('property_id', $propertyId);

        $query = $this->applyFilters($query, $filters);

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function getByRoomType(string $roomTypeId, array $filters = []): LengthAwarePaginator
    {
        $query = Room::with(['property'])
            ->where('room_type_id', $roomTypeId);

        $query = $this->applyFilters($query, $filters);

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function checkAvailability(string $roomId, string $checkIn, string $checkOut): bool
    {
        return ! Booking::where('room_id', $roomId)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->exists();
    }

    public function getAvailableRooms(string $propertyId, string $checkIn, string $checkOut): array
    {
        $rooms = Room::with(['roomType'])
            ->where('property_id', $propertyId)
            ->where('status', 'available')
            ->get();

        return $rooms->filter(function ($room) use ($checkIn, $checkOut) {
            return $this->checkAvailability($room->id, $checkIn, $checkOut);
        })->toArray();
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['room_type_id'] ?? null, fn ($q, $v) => $q->where('room_type_id', $v))
            ->when($filters['floor'] ?? null, fn ($q, $v) => $q->where('floor', $v));
    }
}
