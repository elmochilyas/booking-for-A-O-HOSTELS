<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Guest;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
use Illuminate\Support\Str;

class GuestObserver implements ShouldHandleEventsAfterCommit
{
    public function creating(Guest $guest): void
    {
        $guest->email = Str::lower($guest->email);
        $guest->is_loyalty_member ??= false;
        $guest->loyalty_points ??= 0;
    }

    public function updating(Guest $guest): void
    {
        if ($guest->isDirty('email')) {
            $guest->email_verified_at = null;
        }
    }

    public function updated(Guest $guest): void
    {
        if ($guest->wasChanged(['is_banned', 'ban_reason'])) {
            AuditLog::record(
                'guest_status_changed',
                $guest->id,
                $guest->getChanges()
            );
        }
    }
}
