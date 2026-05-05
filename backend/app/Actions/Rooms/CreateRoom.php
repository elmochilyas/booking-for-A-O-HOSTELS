<?php

namespace App\Actions\Rooms;

use App\Contracts\Repositories\RoomRepositoryInterface;
use App\DTO\CreateRoomDTO;
use App\Events\RoomCreated;
use App\Models\Room;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

readonly class CreateRoom
{
    public function __construct(
        private RoomRepositoryInterface $rooms,
    ) {}

    public function handle(CreateRoomDTO $dto): Room
    {
        return DB::transaction(function () use ($dto) {
            $room = $this->rooms->create([
                'id' => (string) Str::uuid(),
                'property_id' => $dto->propertyId,
                'room_type_id' => $dto->roomTypeId,
                'room_number' => $dto->roomNumber,
                'floor' => $dto->floor,
                'status' => $dto->status,
            ]);

            RoomCreated::dispatch($room);

            return $room->load(['roomType', 'property']);
        });
    }
}
