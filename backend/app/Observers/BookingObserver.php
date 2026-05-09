<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Booking;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
use Illuminate\Support\Facades\Log;

class BookingObserver implements ShouldHandleEventsAfterCommit
{
    public function creating(Booking $booking): void
    {
        $booking->status ??= 'pending';
        $booking->payment_status ??= 'pending';
    }

    public function created(Booking $booking): void
    {
        Log::info('Booking created', [
            'booking_id' => $booking->id,
            'guest_id' => $booking->guest_id,
            'property_id' => $booking->property_id,
        ]);
    }

    public function updated(Booking $booking): void
    {
        if ($booking->wasChanged('status')) {
            AuditLog::record(
                'booking_status_changed',
                $booking->id,
                ['status' => $booking->status]
            );
        }
    }

    public function deleted(Booking $booking): void
    {
        Log::info('Booking deleted', ['booking_id' => $booking->id]);
    }
}
