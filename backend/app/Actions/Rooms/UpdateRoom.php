<?php

declare(strict_types=1);

namespace App\Actions\Rooms;

use App\Contracts\Repositories\RoomRepositoryInterface;
use App\DTO\UpdateRoomDTO;
use App\Models\Room;

readonly class UpdateRoom
{
    public function __construct(
        private RoomRepositoryInterface $rooms,
    ) {}

    public function handle(Room $room, UpdateRoomDTO $dto): Room
    {
        $data = $dto->toArray();

        return $this->rooms->update($room, $data);
    }
}
