<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Guest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GuestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['reception', 'manager', 'admin', 'superadmin']);
    }

    public function view(User $user, Guest $guest): Response
    {
        if ($user->id === $guest->user_id) {
            return Response::allow();
        }

        if ($user->hasRole(['reception', 'manager', 'admin', 'superadmin'])) {
            return Response::allow();
        }

        return Response::denyAsNotFound();
    }

    public function create(User $user): bool
    {
        return true; // Registration is open
    }

    public function update(User $user, Guest $guest): Response
    {
        if ($user->id !== $guest->user_id && ! $user->hasRole(['admin', 'superadmin'])) {
            return Response::deny('Unauthorized to update this guest.');
        }

        return Response::allow();
    }

    public function delete(User $user, Guest $guest): Response
    {
        if ($user->id !== $guest->user_id && ! $user->hasRole('superadmin')) {
            return Response::deny('Unauthorized to delete this guest.');
        }

        return Response::allow();
    }

    public function ban(User $user): bool
    {
        return $user->hasRole(['admin', 'superadmin']);
    }

    public function unban(User $user): bool
    {
        return $user->hasRole(['admin', 'superadmin']);
    }
}
