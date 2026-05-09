<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\Models\Property;
use Illuminate\Support\Str;

readonly class CreatePropertyAction
{
    public function __construct(
        private PropertyRepositoryInterface $propertyRepository,
    ) {}

    public function handle(array $data): Property
    {
        $data['id'] = Str::uuid()->toString();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return $this->propertyRepository->create($data);
    }
}
