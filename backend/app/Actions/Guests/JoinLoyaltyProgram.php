<?php

declare(strict_types=1);

namespace App\Actions\Guests;

use App\Models\Guest;

readonly class JoinLoyaltyProgram
{
    public function handle(Guest $guest): Guest
    {
        if ($guest->is_loyalty_member) {
            throw new \Exception('Already a loyalty member');
        }

        $guest->update(['is_loyalty_member' => true]);

        return $guest->fresh();
    }
}
