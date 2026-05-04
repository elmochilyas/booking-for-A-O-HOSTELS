<?php

namespace Database\Seeders;

use App\Models\AdminRole;
use App\Models\Staff;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $roles = AdminRole::all()->keyBy('slug');

        $admins = [
            [
                'id' => Str::uuid()->toString(),
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'email' => 'superadmin@ao.com',
                'password_hash' => Hash::make('super123'),
                'role' => 'admin',
                'admin_role_id' => $roles->get('superadmin')?->id,
                'is_active' => true,
            ],
            [
                'id' => Str::uuid()->toString(),
                'first_name' => 'Regional',
                'last_name' => 'Manager',
                'email' => 'regional@ao.com',
                'password_hash' => Hash::make('regional123'),
                'role' => 'admin',
                'admin_role_id' => $roles->get('regional_admin')?->id,
                'is_active' => true,
            ],
            [
                'id' => Str::uuid()->toString(),
                'first_name' => 'Property',
                'last_name' => 'Manager',
                'email' => 'property@ao.com',
                'password_hash' => Hash::make('property123'),
                'role' => 'admin',
                'admin_role_id' => $roles->get('property_admin')?->id,
                'is_active' => true,
            ],
            [
                'id' => Str::uuid()->toString(),
                'first_name' => 'Hotel',
                'last_name' => 'Manager',
                'email' => 'manager@ao.com',
                'password_hash' => Hash::make('manager123'),
                'role' => 'admin',
                'admin_role_id' => $roles->get('manager')?->id,
                'is_active' => true,
            ],
            [
                'id' => Str::uuid()->toString(),
                'first_name' => 'Reception',
                'last_name' => 'Staff',
                'email' => 'reception@ao.com',
                'password_hash' => Hash::make('reception123'),
                'role' => 'reception',
                'is_active' => true,
            ],
        ];

        foreach ($admins as $admin) {
            Staff::updateOrCreate(
                ['email' => $admin['email']],
                $admin
            );
        }
    }
}
