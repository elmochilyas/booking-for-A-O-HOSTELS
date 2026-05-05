<?php

namespace App\Contracts\Repositories;

use App\Models\Room;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface RoomRepositoryInterface
{
    public function find(string $id): ?Room;
    public function findOrFail(string $id): Room;
    public function create(array $data): Room;
    public function update(Room $room, array $data): Room;
    public function delete(Room $room): bool;
    public function getByProperty(string $propertyId, array $filters = []): LengthAwarePaginator;
    public function getByRoomType(string $roomTypeId, array $filters = []): LengthAwarePaginator;
    public function checkAvailability(string $roomId, string $checkIn, string $checkOut): bool;
    public function getAvailableRooms(string $propertyId, string $checkIn, string $checkOut): array;
}
