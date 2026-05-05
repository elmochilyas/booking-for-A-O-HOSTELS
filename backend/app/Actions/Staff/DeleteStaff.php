<?php

namespace App\Actions\Staff;

use App\Models\Staff;

readonly class DeleteStaff
{
    public function handle(Staff $staff): void
    {
        $staff->update(['is_active' => false]);
    }
}
