<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Exceptions\EmailNotVerifiedException;
use App\Exceptions\InvalidCredentialsException;
use App\Services\JwtService;
use Illuminate\Support\Facades\Hash;

readonly class LoginGuestAction
{
    public function __construct(
        private GuestRepositoryInterface $guests,
        private JwtService $jwtService,
    ) {}

    public function handle(string $email, string $password): array
    {
        $guest = $this->guests->findByEmail($email);

        if (! $guest || ! Hash::check($password, $guest->password_hash)) {
            throw new InvalidCredentialsException('Invalid credentials');
        }

        if (! $guest->email_verified_at) {
            throw new EmailNotVerifiedException('Email not verified');
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
