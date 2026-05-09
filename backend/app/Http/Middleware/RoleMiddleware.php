<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    private const HIERARCHY = [
        'superadmin' => ['superadmin', 'regional_admin', 'property_admin', 'manager', 'admin', 'reception', 'staff'],
        'regional_admin' => ['regional_admin', 'property_admin', 'manager', 'admin', 'reception', 'staff'],
        'property_admin' => ['property_admin', 'manager', 'admin', 'reception', 'staff'],
        'manager' => ['manager', 'admin', 'reception', 'staff'],
        'admin' => ['admin', 'reception', 'staff'],
        'reception' => ['reception', 'staff'],
        'staff' => ['staff'],
    ];

    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Expand pipe-separated role strings (e.g. "superadmin|regional_admin") into individual roles
        $expanded = [];
        foreach ($roles as $r) {
            foreach (explode('|', $r) as $part) {
                $expanded[] = trim($part);
            }
        }

        $userRole = $user->role ?? null;
        $adminRoleSlug = $user->adminRole?->slug ?? null;

        if (! $this->hasRequiredRole($userRole, $adminRoleSlug, $expanded)) {
            return response()->json(['error' => 'Forbidden - insufficient permissions'], 403);
        }

        return $next($request);
    }

    private function hasRequiredRole(?string $role, ?string $adminRoleSlug, array $requiredRoles): bool
    {
        $effectiveRole = $adminRoleSlug ?? $role;

        if (! $effectiveRole) {
            return false;
        }

        // Get all roles this user can access based on their position in the hierarchy
        $userCanAccess = self::HIERARCHY[$effectiveRole] ?? [$effectiveRole];

        foreach ($requiredRoles as $requiredRole) {
            if (in_array($requiredRole, $userCanAccess)) {
                return true;
            }
        }

        return false;
    }
}
