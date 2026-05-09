<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Contracts\Repositories\StaffRepositoryInterface;
use App\Models\Staff;

readonly class DeactivateStaffAction
{
    public function __construct(
        private StaffRepositoryInterface $staffRepository,
    ) {}

    public function handle(Staff $staff): Staff
    {
        return $this->staffRepository->update($staff, ['is_active' => false]);
    }
}
