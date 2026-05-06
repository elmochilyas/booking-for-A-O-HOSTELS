<?php

namespace App\Listeners;

use App\Events\BookingCreated;
use App\Modules\Notifications\Services\EmailNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;

#[Tries(3)]
#[Backoff([10, 60, 300])]
class SendBookingConfirmation implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EmailNotificationService $emailService,
    ) {}

    public function handle(BookingCreated $event): void
    {
        $this->emailService->sendBookingConfirmation($event->booking);
    }

    public function failed(BookingCreated $event, \Throwable $e): void
    {
        \Log::error('Booking confirmation failed', [
            'booking_id' => $event->booking->id,
            'error' => $e->getMessage(),
        ]);
    }
}
