<?php

declare(strict_types=1);

namespace App\DTO;

use App\Http\Requests\Api\Property\CreatePropertyRequest;

readonly class CreatePropertyDTO
{
    public function __construct(
        public string $name,
        public string $location,
        public string $address,
        public ?float $latitude,
        public ?float $longitude,
        public string $checkInTime,
        public string $checkOutTime,
        public int $totalRooms,
        public ?string $description = null,
        public ?string $phone = null,
        public ?string $email = null,
    ) {}

    public static function fromRequest(CreatePropertyRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            location: $request->validated('location'),
            address: $request->validated('address'),
            latitude: $request->validated('latitude'),
            longitude: $request->validated('longitude'),
            checkInTime: $request->validated('check_in_time'),
            checkOutTime: $request->validated('check_out_time'),
            totalRooms: $request->validated('total_rooms'),
            description: $request->validated('description'),
            phone: $request->validated('phone'),
            email: $request->validated('email'),
        );
    }
}
