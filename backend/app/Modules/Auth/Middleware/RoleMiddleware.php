<?php

namespace App\Modules\Auth\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->get('auth_user');
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $userRole = $user->role ?? null;

        if (!in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'Insufficient permissions',
                'required_roles' => $roles,
                'current_role' => $userRole,
            ], 403);
        }

        return $next($request);
    }
}