<?php>

namespace Tests\Unit\Actions;

use App\Actions\Bookings\CreateBooking;
use App\Actions\Auth\RegisterGuestAction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class)->in('Unit/Actions');

test('CreateBooking action has handle method', function () {
    expect(class_exists(CreateBooking::class))->toBeTrue();
    expect(method_exists(CreateBooking::class, 'handle'))->toBeTrue();
});

test('RegisterGuestAction action has handle method', function () {
    expect(class_exists(RegisterGuestAction::class))->toBeTrue();
    expect(method_exists(RegisterGuestAction::class, 'handle'))->toBeTrue();
});

