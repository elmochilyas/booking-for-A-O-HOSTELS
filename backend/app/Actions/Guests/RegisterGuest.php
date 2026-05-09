<?php

declare(strict_types=1);

namespace App\Actions\Guests;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\DTO\CreateGuestDTO;
use App\Enums\GuestStatus;
use App\Models\Guest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

readonly class RegisterGuest
{
    public function __construct(
        private GuestRepositoryInterface $guests,
    ) {}

    public function handle(CreateGuestDTO $dto): Guest
    {
        $guest = DB::transaction(function () use ($dto) {
            $guest = $this->guests->create([
                'id' => (string) Str::uuid(),
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'email' => $dto->email,
                'password' => bcrypt($dto->password),
                'phone' => $dto->phone,
                'date_of_birth' => $dto->dateOfBirth,
                'loyalty_points' => 0,
                'status' => GuestStatus::ACTIVE,
                'source' => $dto->source?->value,
            ]);

            return $guest;
        });

        return $guest;
    }
}
