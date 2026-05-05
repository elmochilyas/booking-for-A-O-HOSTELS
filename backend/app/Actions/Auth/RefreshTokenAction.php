<?php

namespace App\Actions\Auth;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Services\JwtService;

readonly class RefreshTokenAction
{
    public function __construct(
        private JwtService $jwtService,
        private GuestRepositoryInterface $guests,
    ) {}

    public function handle(string $refreshToken): array
    {
        $decoded = $this->jwtService->verifyToken($refreshToken);
        $guest = $this->guests->findOrFail($decoded->sub);

        $newToken = $this->jwtService->generateToken($guest);
        $newRefreshToken = $this->jwtService->generateRefreshToken($guest);

        return [
            'access_token' => $newToken,
            'refresh_token' => $newRefreshToken,
            'token_type' => 'bearer',
        ];
    }
}
