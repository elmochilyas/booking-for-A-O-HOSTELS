<?php

namespace App\Enums;

enum PropertyStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case MAINTENANCE = 'maintenance';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::INACTIVE => 'Inactive',
            self::MAINTENANCE => 'Maintenance',
        };
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function color(): string
    {
        return match ($this) {
            self::ACTIVE => 'green',
            self::INACTIVE => 'red',
            self::MAINTENANCE => 'orange',
        };
    }
}
