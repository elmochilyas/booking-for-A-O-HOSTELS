<?php

namespace App\Services;

use App\Models\Guest;
use App\Models\Staff;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
    private string $secretKey;

    private int $ttl;

    private int $refreshTtl;

    private static array $blacklistedTokens = [];

    public function __construct()
    {
        $this->secretKey = config('app.jwt_secret', env('JWT_SECRET', 'default-secret-key'));
        $this->ttl = config('app.jwt_ttl', 15);
        $this->refreshTtl = config('app.jwt_refresh_ttl', 20160);
    }

    public function blacklistToken(string $token, int $expiresAt): void
    {
        $key = hash('sha256', $token);
        self::$blacklistedTokens[$key] = $expiresAt;
    }

    public function isBlacklisted(string $token): bool
    {
        $key = hash('sha256', $token);
        if (isset(self::$blacklistedTokens[$key])) {
            if (self::$blacklistedTokens[$key] < time()) {
                unset(self::$blacklistedTokens[$key]);

                return false;
            }

            return true;
        }

        return false;
    }

    public function generateToken(Guest $guest): string
    {
        $payload = [
            'sub' => $guest->id,
            'email' => $guest->email,
            'type' => 'guest',
            'iat' => time(),
            'exp' => time() + ($this->ttl * 60),
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    public function generateStaffToken(Staff $staff): string
    {
        $payload = [
            'sub' => $staff->id,
            'email' => $staff->email,
            'role' => $staff->role,
            'property_id' => $staff->property_id,
            'type' => 'staff',
            'iat' => time(),
            'exp' => time() + ($this->ttl * 60),
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    public function generateRefreshToken(Guest $guest): string
    {
        $payload = [
            'sub' => $guest->id,
            'type' => 'refresh',
            'iat' => time(),
            'exp' => time() + ($this->refreshTtl * 60),
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    public function verifyToken(string $token): object
    {
        if ($this->isBlacklisted($token)) {
            throw new \Exception('Token has been revoked');
        }

        return JWT::decode($token, new Key($this->secretKey, 'HS256'));
    }

    public function generateEmailVerificationToken(Guest $guest): string
    {
        $payload = [
            'sub' => $guest->id,
            'type' => 'email_verify',
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60),
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    public function generatePasswordResetToken(Guest $guest): string
    {
        $payload = [
            'sub' => $guest->id,
            'type' => 'password_reset',
            'iat' => time(),
            'exp' => time() + (60 * 60),
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    public function verifyEmailToken(string $token): object
    {
        $decoded = $this->verifyToken($token);

        if ($decoded->type !== 'email_verify') {
            throw new \Exception('Invalid token type');
        }

        return $decoded;
    }

    public function verifyPasswordResetToken(string $token): object
    {
        $decoded = $this->verifyToken($token);

        if ($decoded->type !== 'password_reset') {
            throw new \Exception('Invalid token type');
        }

        return $decoded;
    }
}
