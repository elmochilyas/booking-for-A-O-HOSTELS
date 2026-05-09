<?php

declare(strict_types=1);

namespace App\Actions\Rooms;

use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\Http\Requests\Api\Room\CreateRoomRequest;

readonly class CheckRoomAvailability
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
    ) {}

    public function handle(CreateRoomRequest $request): array
    {
        $validated = $request->validated();

        return $this->properties->getAvailableRooms(
            $validated['property_id'],
            $validated['check_in'],
            $validated['check_out']
        );
    }
}
