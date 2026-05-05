<?php

namespace App\DTO;

use App\Http\Requests\Api\Guest\ChangePasswordRequest;

readonly class ChangePasswordDTO
{
    public function __construct(
        public string $currentPassword,
        public string $newPassword,
    ) {}

    public static function fromRequest(ChangePasswordRequest $request): self
    {
        return new self(
            currentPassword: $request->validated('current_password'),
            newPassword: $request->validated('new_password'),
        );
    }
}
