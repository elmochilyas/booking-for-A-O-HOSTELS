<?php

namespace App\Actions\Rooms;

use App\Contracts\Repositories\RoomRepositoryInterface;

readonly class GetPropertyRooms
{
    public function __construct(
        private RoomRepositoryInterface $rooms,
    ) {}

    public function handle(string $propertyId): array
    {
        return $this->rooms->getByProperty($propertyId);
    }
}
