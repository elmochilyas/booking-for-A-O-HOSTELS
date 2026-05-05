<?php

namespace App\DTO;

use App\Http\Requests\Api\Room\CreateRoomRequest;

readonly class CreateRoomDTO
{
    public function __construct(
        public string $propertyId,
        public string $roomTypeId,
        public string $roomNumber,
        public ?int $floor = null,
        public ?string $status = 'available',
    ) {}

    public static function fromRequest(CreateRoomRequest $request): self
    {
        return new self(
            propertyId: $request->validated('property_id'),
            roomTypeId: $request->validated('room_type_id'),
            roomNumber: $request->validated('room_number'),
            floor: $request->validated('floor'),
            status: $request->validated('status') ?? 'available',
        );
    }
}
