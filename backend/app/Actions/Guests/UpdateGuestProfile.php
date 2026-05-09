<?php

declare(strict_types=1);

namespace App\Actions\Guests;

use App\DTO\UpdateGuestProfileDTO;
use App\Models\Guest;

readonly class UpdateGuestProfile
{
    public function handle(Guest $guest, UpdateGuestProfileDTO $dto): Guest
    {
        $data = array_filter([
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'phone' => $dto->phone,
            'country' => $dto->country,
            'date_of_birth' => $dto->dateOfBirth,
        ], fn ($v) => ! is_null($v));

        $guest->update($data);

        return $guest->fresh();
    }
}
