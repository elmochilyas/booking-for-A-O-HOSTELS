<?php

namespace App\Enums;

enum StaffRole: string
{
    case SUPERADMIN = 'superadmin';
    case REGIONAL_ADMIN = 'regional_admin';
    case PROPERTY_ADMIN = 'property_admin';
    case MANAGER = 'manager';
    case ADMIN = 'admin';
    case RECEPTION = 'reception';
    case STAFF = 'staff';

    public function label(): string
    {
        return match ($this) {
            self::SUPERADMIN => 'Super Admin',
            self::REGIONAL_ADMIN => 'Regional Admin',
            self::PROPERTY_ADMIN => 'Property Admin',
            self::MANAGER => 'Manager',
            self::ADMIN => 'Admin',
            self::RECEPTION => 'Reception',
            self::STAFF => 'Staff',
        };
    }

    public function isAdmin(): bool
    {
        return in_array($this, [
            self::SUPERADMIN,
            self::REGIONAL_ADMIN,
            self::PROPERTY_ADMIN,
            self::MANAGER,
            self::ADMIN,
        ]);
    }

    public function hierarchyLevel(): int
    {
        return match ($this) {
            self::SUPERADMIN => 100,
            self::REGIONAL_ADMIN => 80,
            self::PROPERTY_ADMIN => 60,
            self::MANAGER => 50,
            self::ADMIN => 40,
            self::RECEPTION => 30,
            self::STAFF => 20,
        };
    }

    public function canManage(self $other): bool
    {
        return $this->hierarchyLevel() > $other->hierarchyLevel();
    }
}
