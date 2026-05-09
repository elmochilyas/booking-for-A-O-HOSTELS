<?php

declare(strict_types=1);

namespace App\Actions\Rooms;

use App\Contracts\Repositories\PropertyRepositoryInterface;

readonly class GetPropertyRoomTypes
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
    ) {}

    public function handle(string $propertyId): array
    {
        return $this->properties->getRoomTypes($propertyId);
    }
}
