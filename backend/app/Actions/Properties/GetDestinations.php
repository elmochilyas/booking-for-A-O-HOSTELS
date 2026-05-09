<?php

declare(strict_types=1);

namespace App\Actions\Properties;

use App\Contracts\Repositories\PropertyRepositoryInterface;

readonly class GetDestinations
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
    ) {}

    public function handle(): array
    {
        return $this->properties->getDestinations();
    }
}
