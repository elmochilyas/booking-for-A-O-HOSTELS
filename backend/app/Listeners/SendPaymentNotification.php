<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\PaymentProcessed;
use App\Modules\Notifications\Services\EmailNotificationService;
use App\Modules\Notifications\Services\SmsNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;

#[Tries(3)]
#[Backoff([10, 60, 300])]
class SendPaymentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EmailNotificationService $emailService,
        private SmsNotificationService $smsService,
    ) {}

    public function handle(PaymentProcessed $event): void
    {
        $payment = $event->payment;
        $booking = $payment->booking;

        if ($booking && $booking->guest) {
            $this->emailService->sendPaymentConfirmation($payment);
            $this->smsService->sendPaymentConfirmation($payment);
        }
    }

    public function failed(PaymentProcessed $event, \Throwable $e): void
    {
        \Log::error('Payment notification failed', [
            'payment_id' => $event->payment->id,
            'error' => $e->getMessage(),
        ]);
    }
}
