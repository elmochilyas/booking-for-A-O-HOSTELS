<?php

namespace App\Actions\Guests;

use App\Models\Guest;

readonly class GetGuestProfile
{
    public function handle(Guest $guest): Guest
    {
        return $guest->fresh();
    }
}
