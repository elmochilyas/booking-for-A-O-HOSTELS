<?php

namespace App\Actions\Auth;

use App\Contracts\Repositories\GuestRepositoryInterface;
use Illuminate\Support\Facades\Hash;

readonly class ResetPasswordAction
{
    public function __construct(
        private \App\Services\JwtService $jwtService,
        private GuestRepositoryInterface $guests,
    ) {}

    public function handle(string $token, string $password): array
    {
        try {
            $decoded = $this->jwtService->verifyPasswordResetToken($token);
            $guest = $this->guests->findOrFail($decoded->sub);
        } catch (\Exception $e) {
            throw new \App\Exceptions\InvalidTokenException('Invalid or expired reset token');
        }

        $this->guests->update($guest, [
            'password_hash' => bcrypt($password),
        ]);

        return ['message' => 'Password reset successfully'];
    }
}
