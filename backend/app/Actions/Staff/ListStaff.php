<?php

declare(strict_types=1);

namespace App\Actions\Staff;

use App\Contracts\Repositories\StaffRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

readonly class ListStaff
{
    public function __construct(
        private StaffRepositoryInterface $staff,
    ) {}

    public function handle(array $filters = []): Collection
    {
        return $this->staff->getPaginated($filters);
    }
}
