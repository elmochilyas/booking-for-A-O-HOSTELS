<?php

namespace App\Actions\Admin;

use App\Models\Extra;

readonly class UpdateExtraAction
{
    public function handle(Extra $extra, array $data): Extra
    {
        $extra->update($data);

        return $extra->fresh();
    }
}
