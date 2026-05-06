<?php

namespace App\DTO;

use App\Enums\RoomStatus;
use App\Http\Requests\Api\Room\CreateRoomRequest;

readonly class CreateRoomDTO
{
    public function __construct(
        public string $propertyId,
        public string $roomTypeId,
        public string $roomNumber,
        public ?int $floor = null,
        public ?RoomStatus $status = RoomStatus::AVAILABLE,
    ) {}

    public static function fromRequest(CreateRoomRequest $request): self
    {
        $status = $request->validated('status') ?? RoomStatus::AVAILABLE->value;
        return new self(
            propertyId: $request->validated('property_id'),
            roomTypeId: $request->validated('room_type_id'),
            roomNumber: $request->validated('room_number'),
            floor: $request->validated('floor'),
            status: $status instanceof RoomStatus ? $status : RoomStatus::from($status),
        );
    }

    public static function fromArray(array $data): self
    {
        $status = $data['status'] ?? RoomStatus::AVAILABLE->value;
        return new self(
            propertyId: $data['property_id'] ?? '',
            roomTypeId: $data['room_type_id'] ?? '',
            roomNumber: $data['room_number'] ?? '',
            floor: $data['floor'] ?? null,
            status: $status instanceof RoomStatus ? $status : RoomStatus::from($status),
        );
    }
}
