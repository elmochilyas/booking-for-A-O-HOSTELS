<?php

namespace App\Actions\Properties;

use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\DTO\CreatePropertyDTO;
use App\Events\PropertyCreated;
use App\Models\Property;
use Illuminate\Support\Facades\DB;

readonly class CreateProperty'
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
    ) {}

    public function handle(CreatePropertyDTO $dto): Property'
    {
        return DB::transaction(function () use ($dto) {
            $property = $this->properties->create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'name' => $dto->name,
                'location' => $dto->location,
                'address' => $dto->address,
                'latitude' => $dto->latitude,
                'longitude' => $dto->longitude,
                'check_in_time' => $dto->checkInTime,
                'check_out_time' => $dto->checkOutTime,
                'total_rooms' => $dto->totalRooms,
                'description' => $dto->description,
                'phone' => $dto->phone,
                'email' => $dto->email,
            ]);

            PropertyCreated::dispatch($property);

            return $property->load(['roomTypes', 'amenities']);
        });
    }
}
