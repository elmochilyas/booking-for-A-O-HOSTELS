<?php

namespace App\Modules\Auth\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Modules\Auth\Services\JwtService;
use App\Models\Guest;
use App\Models\Staff;

class JwtMiddleware
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    public function handle(Request $request, Closure $next, string $guard = 'guest'): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Authorization token not provided'], 401);
        }

        if ($this->jwtService->isTokenBlacklisted($token)) {
            return response()->json(['message' => 'Token has been revoked'], 401);
        }

        $decoded = $this->jwtService->validateToken($token);

        if (!$decoded) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $userType = $decoded->type ?? 'guest';
        
        if ($guard === 'staff' && $userType !== 'staff') {
            return response()->json(['message' => 'Staff access required'], 403);
        }

        if ($guard === 'guest' && $userType !== 'guest') {
            return response()->json(['message' => 'Guest access required'], 403);
        }

        $user = $userType === 'staff' 
            ? Staff::find($decoded->sub) 
            : Guest::find($decoded->sub);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }

        if ($userType === 'staff' && !($user->is_active ?? true)) {
            return response()->json(['message' => 'Account is deactivated'], 403);
        }

        $request->merge(['auth_user' => $user, 'auth_type' => $userType]);

        return $next($request);
    }
}