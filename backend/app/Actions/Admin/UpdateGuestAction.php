<?php

namespace App\Actions\Admin;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Models\Guest;

readonly class UpdateGuestAction
{
    public function __construct(
        private GuestRepositoryInterface $guestRepository,
    ) {}

    public function handle(Guest $guest, array $data): Guest
    {
        return $this->guestRepository->update($guest, array_filter($data, fn ($v) => $v !== null));
    }
}
