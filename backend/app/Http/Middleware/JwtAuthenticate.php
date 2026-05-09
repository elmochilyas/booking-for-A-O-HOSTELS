<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Guest;
use App\Models\Staff;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticate
{
    public function __construct(
        private JwtService $jwtService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['error' => 'Token not provided'], 401);
        }

        try {
            $decoded = $this->jwtService->verifyToken($token);

            if ($decoded->type === 'guest') {
                $guest = Guest::find($decoded->sub);
                if (! $guest) {
                    return response()->json(['error' => 'User not found'], 401);
                }
                $request->setUserResolver(fn () => $guest);
            } elseif ($decoded->type === 'staff') {
                $staff = Staff::find($decoded->sub);
                if (! $staff) {
                    return response()->json(['error' => 'User not found'], 401);
                }
                $request->setUserResolver(fn () => $staff);
            }

        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid or expired token'], 401);
        }

        return $next($request);
    }
}
