<?php

declare(strict_types=1);

namespace App\Enums;

enum RoomStatus: string
{
    case AVAILABLE = 'available';
    case OCCUPIED = 'occupied';
    case MAINTENANCE = 'maintenance';
    case CLEANING = 'cleaning';
    case RESERVED = 'reserved';

    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Available',
            self::OCCUPIED => 'Occupied',
            self::MAINTENANCE => 'Maintenance',
            self::CLEANING => 'Cleaning',
            self::RESERVED => 'Reserved',
        };
    }

    public function isAvailable(): bool
    {
        return $this === self::AVAILABLE;
    }

    public function color(): string
    {
        return match ($this) {
            self::AVAILABLE => 'green',
            self::OCCUPIED => 'red',
            self::MAINTENANCE => 'orange',
            self::CLEANING => 'yellow',
            self::RESERVED => 'blue',
        };
    }
}
