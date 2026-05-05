<?php

namespace App\Actions\Auth;

readonly class LogoutGuestAction
{
    public function __construct(
        private \App\Services\JwtService $jwtService,
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
