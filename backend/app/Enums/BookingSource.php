<?php

declare(strict_types=1);

namespace App\Enums;

enum BookingSource: string
{
    case WEBSITE = 'website';
    case MOBILE_APP = 'mobile_app';
    case WALK_IN = 'walk_in';
    case PHONE = 'phone';
    case REFERRAL = 'referral';
    case THIRD_PARTY = 'third_party';

    public function label(): string
    {
        return match ($this) {
            self::WEBSITE => 'Website',
            self::MOBILE_APP => 'Mobile App',
            self::WALK_IN => 'Walk In',
            self::PHONE => 'Phone',
            self::REFERRAL => 'Referral',
            self::THIRD_PARTY => 'Third Party',
        };
    }

    public function commissionRate(): float
    {
        return match ($this) {
            self::WEBSITE => 0.0,
            self::MOBILE_APP => 0.0,
            self::WALK_IN => 0.0,
            self::PHONE => 0.02,
            self::REFERRAL => 0.05,
            self::THIRD_PARTY => 0.15,
        };
    }
}
