<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Exceptions\InvalidTokenException;
use App\Models\Guest;
use App\Services\JwtService;

readonly class VerifyEmailAction
{
    public function __construct(
        private JwtService $jwtService,
        private GuestRepositoryInterface $guests,
    ) {}

    public function handle(string $token): array
    {
        try {
            // Try JWT token first
            $decoded = $this->jwtService->verifyEmailToken($token);
            $guest = $this->guests->findOrFail($decoded->sub);
        } catch (\Exception $e) {
            // Try verification token from database
            $guest = Guest::where('verification_token', $token)->first();

            if (! $guest) {
                throw new InvalidTokenException('Invalid or expired verification token');
            }
        }

        $guest->update([
            'email_verified_at' => now(),
            'verification_token' => null,
        ]);

        return ['message' => 'Email verified successfully'];
    }
}
