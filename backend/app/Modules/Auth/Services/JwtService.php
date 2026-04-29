<?php

namespace App\Modules\Auth\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\Guest;
use App\Models\Staff;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cache;

class JwtService
{
    private string $secret;
    private int $ttl;
    private int $refreshTtl;

    public function __construct()
    {
        $this->secret = config('app.jwt_secret', env('JWT_SECRET'));
        $this->ttl = config('app.jwt_ttl', 15);
        $this->refreshTtl = config('app.jwt_refresh_ttl', 10080);
    }

    public function generateToken(Guest|Staff $user, string $type = 'guest'): string
    {
        $issuedAt = time();
        $expire = $issuedAt + ($this->ttl * 60);

        $payload = [
            'iss' => config('app.url'),
            'aud' => config('app.url'),
            'iat' => $issuedAt,
            'exp' => $expire,
            'sub' => $user->id,
            'type' => $type,
            'role' => $user->role ?? 'guest',
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function generateRefreshToken(Guest|Staff $user, string $type = 'guest'): string
    {
        $issuedAt = time();
        $expire = $issuedAt + ($this->refreshTtl * 60);

        $payload = [
            'iss' => config('app.url'),
            'aud' => config('app.url'),
            'iat' => $issuedAt,
            'exp' => $expire,
            'sub' => $user->id,
            'type' => $type,
            'refresh' => true,
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function validateToken(string $token): ?object
    {
        try {
            return JWT::decode($token, new Key($this->secret, 'HS256'));
        } catch (\Exception $e) {
            return null;
        }
    }

    public function isTokenBlacklisted(string $token): bool
    {
        $hash = hash('sha256', $token);
        return Cache::has("jwt_blacklist:{$hash}");
    }

    public function blacklistToken(string $token): void
    {
        $decoded = $this->validateToken($token);
        if ($decoded) {
            $expire = $decoded->exp - time();
            if ($expire > 0) {
                $hash = hash('sha256', $token);
                Cache::put("jwt_blacklist:{$hash}", true, $expire);
            }
        }
    }

    public function refreshTokens(string $refreshToken): ?array
    {
        $decoded = $this->validateToken($refreshToken);
        
        if (!$decoded || !isset($decoded->refresh) || $decoded->refresh !== true) {
            return null;
        }

        if ($this->isTokenBlacklisted($refreshToken)) {
            return null;
        }

        $userType = $decoded->type ?? 'guest';
        $user = $userType === 'staff' 
            ? Staff::find($decoded->sub) 
            : Guest::find($decoded->sub);

        if (!$user || !$user->is_active ?? true) {
            return null;
        }

        return [
            'access_token' => $this->generateToken($user, $userType),
            'refresh_token' => $this->generateRefreshToken($user, $userType),
            'token_type' => 'Bearer',
            'expires_in' => $this->ttl * 60,
        ];
    }
}