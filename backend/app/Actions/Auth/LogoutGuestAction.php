<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Services\JwtService;

readonly class LogoutGuestAction
{
    public function __construct(
        private JwtService $jwtService,
    ) {}

    public function handle(string $token): array
    {
        try {
            $decoded = $this->jwtService->verifyToken($token);
            $this->jwtService->blacklistToken($token, $decoded->exp ?? (time() + 3600));
        } catch (\Exception $e) {
            // Token already invalid, that's ok
        }

        return ['message' => 'Logged out successfully'];
    }
}
