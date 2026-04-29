<?php

namespace App\Modules\Properties\Services;

use App\Models\Property;
use App\Models\RoomType;
use App\Models\Room;
use Illuminate\Support\Facades\Cache;

class PropertyService
{
    public function getAllProperties(array $filters = [])
    {
        $query = Property::query();

        if (!empty($filters['location'])) {
            $query->where('location', 'like', '%' . $filters['location'] . '%');
        }

        return $query->get();
    }

    public function getPropertyById(string $id): ?Property
    {
        return Cache::remember("property:{$id}", 3600, function () use ($id) {
            return Property::with(['roomTypes.amenities'])->find($id);
        });
    }

    public function createProperty(array $data): Property
    {
        return Property::create($data);
    }

    public function updateProperty(Property $property, array $data): Property
    {
        $property->update($data);
        Cache::forget("property:{$property->id}");
        return $property;
    }

    public function deleteProperty(Property $property): void
    {
        $property->delete();
        Cache::forget("property:{$property->id}");
    }

    public function getRoomTypes(string $propertyId): array
    {
        return Cache::remember("property:{$propertyId}:roomtypes", 3600, function () use ($propertyId) {
            return RoomType::where('property_id', $propertyId)->with('amenities')->get()->toArray();
        });
    }

    public function getRooms(string $propertyId): array
    {
        return Room::where('property_id', $propertyId)->get()->toArray();
    }

    public function createRoomType(string $propertyId, array $data): RoomType
    {
        return RoomType::create(array_merge($data, ['property_id' => $propertyId]));
    }

    public function updateRoomType(RoomType $roomType, array $data): RoomType
    {
        $roomType->update($data);
        Cache::forget("property:{$roomType->property_id}:roomtypes");
        return $roomType;
    }
}