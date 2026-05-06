<?php

namespace App\DTO;

use App\Http\Requests\Api\Guest\UpdateNotificationsRequest;

readonly class UpdateNotificationsDTO
{
    public function __construct(
        public ?bool $notificationEmail = null,
        public ?bool $notificationSms = null,
    ) {}

    public static function fromRequest(UpdateNotificationsRequest $request): self
    {
        return new self(
            notificationEmail: $request->validated('notification_email'),
            notificationSms: $request->validated('notification_sms'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            notificationEmail: $data['notification_email'] ?? null,
            notificationSms: $data['notification_sms'] ?? null,
        );
    }
}
