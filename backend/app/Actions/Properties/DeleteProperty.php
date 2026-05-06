<?php

namespace App\Actions\Properties;

use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\Models\Property;

readonly class DeleteProperty
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
    ) {}

    public function handle(Property $property): void
    {
        $this->properties->delete($property);
    }
}
