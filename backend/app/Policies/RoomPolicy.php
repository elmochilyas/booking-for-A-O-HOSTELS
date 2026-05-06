<?php

namespace App\Policies;

use App\Models\Room;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class RoomPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Room $room): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'manager', 'superadmin', 'property_admin']);
    }

    public function update(User $user, Room $room): Response
    {
        if ($user->hasRole('superadmin')) {
            return Response::allow();
        }

        if ($user->hasRole('property_admin') && $user->property_id === $room->property_id) {
            return Response::allow();
        }

        return Response::deny('Unauthorized to update this room.');
    }

    public function delete(User $user, Room $room): Response
    {
        if (! $user->hasRole(['admin', 'superadmin'])) {
            return Response::deny('Unauthorized to delete rooms.');
        }

        return Response::allow();
    }

    public function updateStatus(User $user, Room $room): bool
    {
        return $user->hasRole(['reception', 'manager', 'admin', 'superadmin', 'property_admin']);
    }
}
