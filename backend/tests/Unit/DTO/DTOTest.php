<?php>

namespace Tests\Unit\DTO;

use App\DTO\CreateBookingDTO;
use App\DTO\RegisterGuestDTO;
use App\Enums\PaymentMethod;

test('CreateBookingDTO is readonly class', function () {
    $reflection = new ReflectionClass(CreateBookingDTO::class);
    expect($reflection->isReadonly())->toBeTrue();
});

test('RegisterGuestDTO is readonly class', function () {
    $reflection = new ReflectionClass(RegisterGuestDTO::class);
    expect($reflection->isReadonly())->toBeTrue();
});

