<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\Models\Property;

readonly class UpdatePropertyAction
{
    public function __construct(
        private PropertyRepositoryInterface $propertyRepository,
    ) {}

    public function handle(Property $property, array $data): Property
    {
        return $this->propertyRepository->update($property, $data);
    }
}
