<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Guest;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Room;
use App\Policies\BookingPolicy;
use App\Policies\GuestPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PropertyPolicy;
use App\Policies\RoomPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Booking::class => BookingPolicy::class,
        Property::class => PropertyPolicy::class,
        Guest::class => GuestPolicy::class,
        Payment::class => PaymentPolicy::class,
        Room::class => RoomPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Gate::before() for superadmin bypass
        Gate::before(function ($user, $ability) {
            if ($user->hasRole('superadmin')) {
                return true;
            }

            return null; // Continue with normal authorization
        });

        // Define non-model gates
        Gate::define('view-dashboard', fn ($user) => $user->hasRole(['admin', 'manager', 'superadmin']));
        Gate::define('access-reports', fn ($user) => $user->hasRole(['admin', 'manager', 'superadmin']));
    }
}
