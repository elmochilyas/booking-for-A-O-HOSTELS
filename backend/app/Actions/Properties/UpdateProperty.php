<?php

namespace App\Actions\Properties;

use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\DTO\UpdatePropertyDTO;
use App\Models\Property;

readonly class UpdateProperty
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
    ) {}

    public function handle(Property $property, UpdatePropertyDTO $dto): Property
    {
        $data = $dto->toArray();

        return $this->properties->update($property, $data);
    }
}
