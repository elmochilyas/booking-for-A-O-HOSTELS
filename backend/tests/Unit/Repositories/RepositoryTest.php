<?php>

namespace Tests\Unit\Repositories;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PropertyRepositoryInterface;

test('BookingRepository implements BookingRepositoryInterface', function () {
    $repo = app(BookingRepositoryInterface::class);
    expect($repo)->toBeInstanceOf(BookingRepositoryInterface::class);
});

test('PropertyRepository implements PropertyRepositoryInterface', function () {
    $repo = app(PropertyRepositoryInterface::class);
    expect($repo)->toBeInstanceOf(PropertyRepositoryInterface::class);
});

