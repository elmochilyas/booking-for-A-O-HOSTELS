<?php

namespace App\Actions\Auth;

use App\Contracts\Repositories\GuestRepositoryInterface;

readonly class ForgotPasswordAction
{
    public function __construct(
        private \App\Services\JwtService $jwtService,
        private \App\Services\EmailService $emailService,
        private GuestRepositoryInterface $guests,
    ) {}

    public function handle(string $email): array
    {
        $guest = $this->guests->findByEmail($email);

        if ($guest) {
            $resetToken = $this->jwtService->generatePasswordResetToken($guest);
            $this->emailService->sendPasswordResetEmail($guest, $resetToken);
        }

        // Always return success to prevent email enumeration
        return ['message' => 'If the email exists, a password reset link has been sent.'];
    }
}
