<?php

declare(strict_types=1);

namespace App\Actions\Guests;

use App\Models\Guest;

readonly class GetGuestProfile
{
    public function handle(Guest $guest): Guest
    {
        return $guest->fresh();
    }
}
