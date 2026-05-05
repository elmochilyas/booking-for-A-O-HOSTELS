<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;

class PaymentProcessed implements ShouldDispatchAfterCommit
{
    use Dispatchable;

    public function __construct(
        public readonly Booking $booking,
    ) {}
}
