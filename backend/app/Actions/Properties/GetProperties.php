<?php

namespace App\Actions\Properties;

use App\Contracts\Repositories\PropertyRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

readonly class GetProperties
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
    ) {}

    public function handle(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->properties->getPaginated($filters, $perPage);
    }
}
