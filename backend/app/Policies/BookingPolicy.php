<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Booking $booking): Response
    {
        if ($user->id === $booking->guest_id) {
            return Response::allow();
        }

        if ($user->hasRole(['admin', 'manager', 'reception', 'superadmin'])) {
            return Response::allow();
        }

        return Response::denyAsNotFound();
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['guest', 'admin', 'manager', 'superadmin']);
    }

    public function update(User $user, Booking $booking): Response
    {
        if ($user->id !== $booking->guest_id && ! $user->hasRole(['admin', 'manager', 'superadmin'])) {
            return Response::deny('Unauthorized to update this booking.');
        }

        return Response::allow();
    }

    public function delete(User $user, Booking $booking): Response
    {
        if ($user->id !== $booking->guest_id && ! $user->hasRole('superadmin')) {
            return Response::deny('Unauthorized to cancel this booking.');
        }

        return Response::allow();
    }

    public function checkIn(User $user, Booking $booking): bool
    {
        return $user->hasRole(['reception', 'manager', 'admin', 'superadmin']);
    }

    public function checkOut(User $user, Booking $booking): bool
    {
        return $user->hasRole(['reception', 'manager', 'admin', 'superadmin']);
    }
}
