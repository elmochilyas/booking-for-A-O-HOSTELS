<?php

namespace App\DTO;

use App\Http\Requests\Api\Property\UpdatePropertyRequest;

readonly class UpdatePropertyDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $location = null,
        public ?string $address = null,
        public ?float $latitude = null,
        public ?float $longitude = null,
        public ?string $checkInTime = null,
        public ?string $checkOutTime = null,
        public ?int $totalRooms = null,
        public ?string $description = null,
        public ?string $phone = null,
        public ?string $email = null,
    ) {}

    public static function fromRequest(UpdatePropertyRequest $request): self
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

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            location: $data['location'] ?? null,
            address: $data['address'] ?? null,
            latitude: $data['latitude'] ?? null,
            longitude: $data['longitude'] ?? null,
            checkInTime: $data['check_in_time'] ?? $data['checkInTime'] ?? null,
            checkOutTime: $data['check_out_time'] ?? $data['checkOutTime'] ?? null,
            totalRooms: $data['total_rooms'] ?? $data['totalRooms'] ?? null,
            description: $data['description'] ?? null,
            phone: $data['phone'] ?? null,
            email: $data['email'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'location' => $this->location,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'check_in_time' => $this->checkInTime,
            'check_out_time' => $this->checkOutTime,
            'total_rooms' => $this->totalRooms,
            'description' => $this->description,
            'phone' => $this->phone,
            'email' => $this->email,
        ], fn ($value) => ! is_null($value));
    }
}
