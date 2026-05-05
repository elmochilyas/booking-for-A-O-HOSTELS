<?php

namespace App\Enums;

enum GuestStatus: string
{
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case BANNED = 'banned';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::SUSPENDED => 'Suspended',
            self::BANNED => 'Banned',
        };
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function isBanned(): bool
    {
        return $this === self::BANNED;
    }

    public function color(): string
    {
        return match ($this) {
            self::ACTIVE => 'green',
            self::SUSPENDED => 'yellow',
            self::BANNED => 'red',
        };
    }
}
