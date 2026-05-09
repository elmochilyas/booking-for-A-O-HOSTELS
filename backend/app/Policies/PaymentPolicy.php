<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'manager', 'superadmin', 'reception']);
    }

    public function view(User $user, Payment $payment): Response
    {
        // Guest can view their own payments
        if ($user->id === $payment->booking?->guest_id) {
            return Response::allow();
        }

        if ($user->hasRole(['admin', 'manager', 'superadmin', 'reception'])) {
            return Response::allow();
        }

        return Response::denyAsNotFound();
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['guest', 'admin', 'manager', 'superadmin']);
    }

    public function refund(User $user, Payment $payment): bool
    {
        return $user->hasRole(['admin', 'superadmin']);
    }
}
