<?php

namespace App\Actions\Rooms;

use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Models\Room;

readonly class DeleteRoom
{
    public function __construct(
        private RoomRepositoryInterface $rooms,
    ) {}

    public function handle(Room $room): bool
    {
        return $this->rooms->delete($room);
    }
}
