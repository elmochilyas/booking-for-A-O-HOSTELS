<?php>

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonApiResource;

class PropertyJsonApiResource extends JsonApiResource
{
    public function toAttributes($request): array
    {
        return [
            'name' => $this->name,
            'location' => $this->location,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'checkInTime' => $this->check_in_time?->format('H:i'),
            'checkOutTime' => $this->check_out_time?->format('H:i'),
            'totalRooms' => $this->total_rooms,
            'rating' => $this->rating,
            'reviewCount' => $this->review_count,
        ];
    }

    public function toRelationships($request): array
    {
        return [
            'rooms' => RoomJsonApiResource::collection($this->whenLoaded('rooms')),
            'amenities' => AmenityJsonApiResource::collection($this->whenLoaded('amenities')),
        ];
    }

    public function toLinks($request): array
    {
        return [
            'self' => route('api.properties.show', $this->id),
        ];
    }
}
