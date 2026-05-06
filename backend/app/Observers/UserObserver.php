<?php

namespace App\Observers;

use App\Exceptions\CannotDeleteUserException;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\UserSettings;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserObserver implements ShouldHandleEventsAfterCommit
{
    public function creating(User $user): void
    {
        $user->email = Str::lower($user->email);
        $user->username ??= Str::slug($user->name).'_'.Str::random(4);
    }

    public function created(User $user): void
    {
        $user->profile()->create(['bio' => '']);
        $user->settings()->create(UserSettings::defaults());
    }

    public function updating(User $user): void
    {
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        if ($user->isDirty('password')) {
            $user->password_changed_at = now();
        }
    }

    public function updated(User $user): void
    {
        if ($user->wasChanged(['name', 'email', 'role'])) {
            AuditLog::record('user_updated', $user->id, $user->getChanges());
        }
    }

    public function deleting(User $user): void
    {
        if ($user->hasActiveSubscription()) {
            throw new CannotDeleteUserException('User has an active subscription.');
        }
    }

    public function deleted(User $user): void
    {
        $user->posts()->delete();
        Storage::delete("avatars/{$user->id}");
    }
}
