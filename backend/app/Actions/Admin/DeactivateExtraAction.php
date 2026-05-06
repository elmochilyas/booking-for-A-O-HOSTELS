<?php

namespace App\Actions\Admin;

use App\Models\Extra;

readonly class DeactivateExtraAction
{
    public function handle(string $extraId): Extra
    {
        $extra = Extra::findOrFail($extraId);
        $extra->update(['is_active' => false]);

        return $extra;
    }
}
