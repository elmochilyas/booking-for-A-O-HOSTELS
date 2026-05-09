<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use App\DTO\CreateBookingDTO;
use App\DTO\CreateGuestDTO;

test('CreateBookingDTO is readonly class', function () {
    $reflection = new \ReflectionClass(CreateBookingDTO::class);
    expect($reflection->isReadonly())->toBeTrue();
});

test('CreateGuestDTO is readonly class', function () {
    $reflection = new \ReflectionClass(CreateGuestDTO::class);
    expect($reflection->isReadonly())->toBeTrue();
});
