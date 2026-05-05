<?php

namespace App\Actions\Guests;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\DTO\UpdateGuestDTO;
use App\Models\Guest;

readonly class UpdateProfile
{
    public function __construct(
        private GuestRepositoryInterface $guests,
    ) {}

    public function handle(Guest $guest, UpdateGuestDTO $dto): Guest
    {
        $data = $dto->toArray();

        if (! empty($data)) {
            $guest = $this->guests->update($guest, $data);
        }

        return $guest;
    }
}
