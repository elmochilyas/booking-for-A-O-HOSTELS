<?php

namespace App\Actions\Guests;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\DTO\CreateGuestDTO;
use App\Models\Guest;
use Illuminate\Support\Facades\DB;

readonly class RegisterGuest
{
    public function __construct(
        private GuestRepositoryInterface $guests,
    ) {}

    public function handle(CreateGuestDTO $dto): Guest
    {
        $guest = DB::transaction(function () use ($dto) {
            $guest = $this->guests->create([
                'id'            => (string) \Illuminate\Support\Str::uuid(),
                'first_name'    => $dto->firstName,
                'last_name'     => $dto->lastName,
                'email'         => $dto->email,
                'password'      => bcrypt($dto->password),
                'phone'         => $dto->phone,
                'date_of_birth' => $dto->dateOfBirth,
                'loyalty_points' => 0,
                'status'         => \App\Enums\GuestStatus::ACTIVE,
                'source'         => $dto->source?->value,
            ]);

            return $guest;
        });

        return $guest;
    }
}
