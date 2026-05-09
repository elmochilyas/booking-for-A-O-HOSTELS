<?php

declare(strict_types=1);

namespace App\Actions\Properties;

use App\Contracts\Repositories\RoomTypeRepositoryInterface;
use App\Models\RoomType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

readonly class CreateRoomType
{
    public function __construct(
        private RoomTypeRepositoryInterface $roomTypes,
    ) {}

    public function handle(string $propertyId, array $data): RoomType
    {
        return DB::transaction(function () use ($propertyId, $data) {
            $roomTypeData = array_merge($data, [
                'id' => (string) Str::uuid(),
                'property_id' => $propertyId,
            ]);

            return $this->roomTypes->create($roomTypeData);
        });
    }
}
