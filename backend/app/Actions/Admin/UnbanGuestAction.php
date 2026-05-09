<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Models\Guest;

readonly class UnbanGuestAction
{
    public function __construct(
        private GuestRepositoryInterface $guestRepository,
    ) {}

    public function handle(string $guestId): Guest
    {
        $guest = $this->guestRepository->findOrFail($guestId);

        return $this->guestRepository->update($guest, [
            'is_banned' => false,
            'ban_reason' => null,
        ]);
    }
}
