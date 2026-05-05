<?php

namespace App\Providers;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Repositories\StaffRepositoryInterface;
use App\Repositories\EloquentBookingRepository;
use App\Repositories\EloquentGuestRepository;
use App\Repositories\EloquentPaymentRepository;
use App\Repositories\EloquentPropertyRepository;
use App\Repositories\EloquentRoomRepository;
use App\Repositories\EloquentStaffRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(BookingRepositoryInterface::class, EloquentBookingRepository::class);
        $this->app->bind(GuestRepositoryInterface::class, EloquentGuestRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, EloquentPaymentRepository::class);
        $this->app->bind(PropertyRepositoryInterface::class, EloquentPropertyRepository::class);
        $this->app->bind(RoomRepositoryInterface::class, EloquentRoomRepository::class);
        $this->app->bind(StaffRepositoryInterface::class, EloquentStaffRepository::class);
    }
}
