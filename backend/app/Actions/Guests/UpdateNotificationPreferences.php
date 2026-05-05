<?php

namespace App\Actions\Guests;

use App\DTO\UpdateNotificationsDTO;
use App\Models\Guest;

readonly class UpdateNotificationPreferences
{
    public function handle(Guest $guest, UpdateNotificationsDTO $dto): Guest
    {
        $data = array_filter([
            'notification_email' => $dto->notificationEmail,
            'notification_sms' => $dto->notificationSms,
        ], fn ($v) => ! is_null($v));

        $guest->update($data);

        return $guest->fresh();
    }
}
