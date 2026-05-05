<?php

namespace App\Enums;

enum LoyaltyTier: string
{
    case BRONZE   = 'bronze';
    case SILVER   = 'silver';
    case GOLD     = 'gold';
    case PLATINUM = 'platinum';

    public function label(): string
    {
        return match($this) {
            self::BRONZE   => 'Bronze',
            self::SILVER   => 'Silver',
            self::GOLD     => 'Gold',
            self::PLATINUM => 'Platinum',
        };
    }

    public function discountPercentage(): int
    {
        return match($this) {
            self::BRONZE   => 0,
            self::SILVER   => 5,
            self::GOLD     => 10,
            self::PLATINUM => 15,
        };
    }

    public function pointsMultiplier(): float
    {
        return match($this) {
            self::BRONZE   => 1.0,
            self::SILVER   => 1.25,
            self::GOLD     => 1.5,
            self::PLATINUM => 2.0,
        };
    }

    public function color(): string
    {
        return match($this) {
            self::BRONZE   => '#CD7F32',
            self::SILVER   => '#C0C0C0',
            self::GOLD     => '#FFD700',
            self::PLATINUM => '#E5E4E2',
        };
    }

    public static function fromPoints(int $points): self
    {
        return match(true) {
            $points >= 10000 => self::PLATINUM,
            $points >= 5000  => self::GOLD,
            $points >= 1000  => self::SILVER,
            default         => self::BRONZE,
        };
    }
}
