<?php>

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonApiResource;

class AmenityJsonApiResource extends JsonApiResource
{
    public function toAttributes($request): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
        ];
    }
}
