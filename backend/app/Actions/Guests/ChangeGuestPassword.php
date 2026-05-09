<?php

declare(strict_types=1);

namespace App\Actions\Guests;

use App\DTO\ChangePasswordDTO;
use App\Models\Guest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

readonly class ChangeGuestPassword
{
    public function handle(Guest $guest, ChangePasswordDTO $dto): void
    {
        if (! Hash::check($dto->currentPassword, $guest->password_hash)) {
            throw new \Exception('Current password is incorrect');
        }

        $guest->update(['password_hash' => Hash::make($dto->newPassword)]);

        Log::info('Guest password changed', ['guest_id' => $guest->id]);
    }
}
