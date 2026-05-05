<?php

namespace App\Actions\Auth;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\DTO\CreateGuestDTO;
use App\Services\EmailService;
use App\Services\JwtService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

readonly class RegisterGuestAction
{
    public function __construct(
        private GuestRepositoryInterface $guests,
        private JwtService $jwtService,
        private EmailService $emailService,
    ) {}

    public function handle(CreateGuestDTO $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $guest = $this->guests->create([
                'id' => (string) Str::uuid(),
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
