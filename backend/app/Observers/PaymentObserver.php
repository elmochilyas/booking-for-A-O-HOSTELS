<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Payment;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
use Illuminate\Support\Str;

class PaymentObserver implements ShouldHandleEventsAfterCommit
{
    public function creating(Payment $payment): void
    {
        $payment->status ??= 'pending';
        $payment->id ??= Str::uuid()->toString();
    }

    public function created(Payment $payment): void
    {
        AuditLog::record(
            'payment_created',
            $payment->id,
            ['booking_id' => $payment->booking_id, 'amount' => $payment->amount]
        );
    }

    public function updated(Payment $payment): void
    {
        if ($payment->wasChanged('status')) {
            AuditLog::record(
                'payment_status_changed',
                $payment->id,
                ['status' => $payment->status]
            );
        }
    }
}
