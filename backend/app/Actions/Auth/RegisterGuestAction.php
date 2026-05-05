<?php

namespace App\Actions\Auth;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\DTO\CreateGuestDTO;
use App\Models\Guest;
use Illuminate\Support\Facades\DB;

readonly class RegisterGuestAction
{
    public function __construct(
        private GuestRepositoryInterface $guests,
        private \App\Services\JwtService $jwtService,
        private \App\Services\EmailService $emailService,
    ) {}

    public function handle(CreateGuestDTO $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $guest = $this->guests->create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'email' => $dto->email,
                'password_hash' => bcrypt($dto->password),
                'phone' => $dto->phone,
                'date_of_birth' => $dto->dateOfBirth,
                'email_verified_at' => null,
                'is_loyalty_member' => false,
                'loyalty_points' => 0,
                'source' => $dto->source?->value,
            ]);

            $verificationToken = $this->jwtService->generateEmailVerificationToken($guest);
            $this->emailService->sendVerificationEmail($guest, $verificationToken);

            $token = $this->jwtService->generateToken($guest);

            return [
                'message' => 'Registration successful. Please verify your email.',
                'guest' => $guest->makeHidden(['password_hash']),
                'access_token' => $token,
                'token_type' => 'bearer',
            ];
        });
    }
}
