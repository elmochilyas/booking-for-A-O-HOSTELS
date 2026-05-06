<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PropertyPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Property $property): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'manager', 'superadmin']);
    }

    public function update(User $user, Property $property): Response
    {
        if ($user->hasRole('superadmin')) {
            return Response::allow();
        }

        if ($user->hasRole('property_admin') && $user->property_id === $property->id) {
            return Response::allow();
        }

        return Response::deny('Unauthorized to update this property.');
    }

    public function delete(User $user, Property $property): Response
    {
        if (! $user->hasRole('superadmin')) {
            return Response::deny('Only superadmins can delete properties.');
        }

        return Response::allow();
    }
}
