<?php

namespace App\Actions\Auth;

use App\Contracts\Repositories\GuestRepositoryInterface;
use Illuminate\Support\Facades\Hash;

readonly class LoginGuestAction
{
    public function __construct(
        private GuestRepositoryInterface $guests,
        private \App\Services\JwtService $jwtService,
    ) {}

    public function handle(string $email, string $password): array
    {
        $guest = $this->guests->findByEmail($email);

        if (! $guest || ! Hash::check($password, $guest->password_hash)) {
            throw new \App\Exceptions\InvalidCredentialsException('Invalid credentials');
        }

        if (! $guest->email_verified_at) {
            throw new \App\Exceptions\EmailNotVerifiedException('Email not verified');
        }

        $token = $this->jwtService->generateToken($guest);
        $refreshToken = $this->jwtService->generateRefreshToken($guest);

        return [
            'message' => 'Login successful',
            'user' => $guest->makeHidden(['password_hash']),
            'access_token' => $token,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',
        ];
    }
}
