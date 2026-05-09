<?php

declare(strict_types=1);

namespace App\Actions\Rooms;

use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Models\Room;

readonly class GetRoom
{
    public function __construct(
        private RoomRepositoryInterface $rooms,
    ) {}

    public function handle(string $id): Room
    {
        return $this->rooms->findOrFail($id);
    }
}
