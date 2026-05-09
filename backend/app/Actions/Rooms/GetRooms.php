<?php

declare(strict_types=1);

namespace App\Actions\Rooms;

use App\Contracts\Repositories\RoomRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

readonly class GetRooms
{
    public function __construct(
        private RoomRepositoryInterface $rooms,
    ) {}

    public function handle(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->rooms->getPaginated($filters, $perPage);
    }
}
