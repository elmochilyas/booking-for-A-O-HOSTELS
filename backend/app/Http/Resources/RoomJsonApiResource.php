<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonApiResource;

class RoomJsonApiResource extends JsonApiResource
{
    public function toAttributes($request): array
    {
        return [
            'roomNumber' => $this->room_number,
            'floor' => $this->floor,
            'status' => $this->status,
            'features' => $this->features,
            'view' => $this->view,
            'windowType' => $this->window_type,
        ];
    }

    public function toRelationships($request): array
    {
        return [
            'roomType' => RoomTypeJsonApiResource::make($this->whenLoaded('roomType')),
        ];
    }
}
