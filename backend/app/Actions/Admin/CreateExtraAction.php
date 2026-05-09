<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Models\Extra;
use Illuminate\Support\Str;

readonly class CreateExtraAction
{
    public function handle(array $data): Extra
    {
        return Extra::create([
            'id' => Str::uuid()->toString(),
            ...$data,
        ]);
    }
}
