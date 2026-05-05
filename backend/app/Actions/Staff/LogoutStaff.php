<?php

namespace App\Actions\Staff;

use App\Services\JwtService;

readonly class LogoutStaff
{
    public function __construct(
        private JwtService $jwtService,
    ) {}

    public function handle(?string $token): void
    {
        if (! $token) {
            return;
        }

        try {
            $decoded = $this->jwtService->verifyToken($token);
            $this->jwtService->blacklistToken($token, $decoded->exp ?? (time() + 3600));
        } catch (\Exception $e) {
            // Token already invalid, ignore
        }
    }
}
