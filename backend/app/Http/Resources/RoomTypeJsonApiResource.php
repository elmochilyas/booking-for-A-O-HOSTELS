<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonApiResource;

class RoomTypeJsonApiResource extends JsonApiResource
{
    public function toAttributes($request): array
    {
        return [
            'name' => $this->name,
            'capacity' => $this->capacity,
            'basePrice' => $this->base_price,
            'description' => $this->description,
            'amenities' => $this->amenities,
            'maxOccupancy' => $this->max_occupancy,
        ];
    }
}
