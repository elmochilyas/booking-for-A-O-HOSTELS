<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdminRole;
use Illuminate\Database\Seeder;

class AdminRoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'superadmin',
                'description' => 'Full system access',
                'level' => 100,
                'is_system' => true,
                'permissions' => json_encode(['*']),
            ],
            [
                'name' => 'Regional Admin',
                'slug' => 'regional_admin',
                'description' => 'Manage multiple properties in a region',
                'level' => 75,
                'is_system' => true,
                'permissions' => json_encode(['properties.*', 'bookings.*', 'guests.*', 'payments.*', 'reports.view']),
            ],
            [
                'name' => 'Property Admin',
                'slug' => 'property_admin',
                'description' => 'Manage single property',
                'level' => 50,
                'is_system' => true,
                'permissions' => json_encode(['bookings.*', 'guests.*', 'rooms.*', 'payments.view']),
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Property manager with limited access',
                'level' => 25,
                'is_system' => true,
                'permissions' => json_encode(['bookings.view', 'bookings.edit', 'guests.view', 'rooms.view']),
            ],
            [
                'name' => 'Reception',
                'slug' => 'reception',
                'description' => 'Front desk staff',
                'level' => 10,
                'is_system' => true,
                'permissions' => json_encode(['bookings.view', 'bookings.checkin', 'guests.view']),
            ],
            [
                'name' => 'Housekeeping',
                'slug' => 'housekeeping',
                'description' => 'Room cleaning staff',
                'level' => 5,
                'is_system' => true,
                'permissions' => json_encode(['rooms.view', 'rooms.status']),
            ],
            [
                'name' => 'Maintenance',
                'slug' => 'maintenance',
                'description' => 'Technical maintenance',
                'level' => 5,
                'is_system' => true,
                'permissions' => json_encode(['rooms.view', 'maintenance.*']),
            ],
        ];

        foreach ($roles as $role) {
            AdminRole::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }
    }
}
