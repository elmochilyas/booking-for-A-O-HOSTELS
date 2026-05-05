<?php

namespace App\Actions\Guests;

use App\Models\Guest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

readonly class DeleteGuestAccount
{
    public function handle(Guest $guest, string $password): void
    {
        if (! Hash::check($password, $guest->password_hash)) {
            throw new \Exception('Password is incorrect');
        }

        Log::info('Guest account deleted', [
            'guest_id' => $guest->id,
            'email' => $guest->email,
            'deleted_at' => now()->toIso8601String(),
        ]);

        $guest->bookings()->delete();
        $guest->views()->delete();
        $guest->delete();
    }
}
