<?php

namespace App\Modules\Auth\Services;

use App\Models\Staff;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    public function generateQRCodeUrl(string $email, string $secret): string
    {
        return $this->google2fa->getQRCodeUrl(
            config('app.name', 'A&O Hostels'),
            $email,
            $secret
        );
    }

    public function verifyCode(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code);
    }

    public function enable2FA(Staff $staff, string $secret): void
    {
        $staff->update([
            'two_factor_secret' => $secret,
            'two_factor_enabled' => true,
        ]);
    }

    public function disable2FA(Staff $staff): void
    {
        $staff->update([
            'two_factor_secret' => null,
            'two_factor_enabled' => false,
        ]);
    }
}