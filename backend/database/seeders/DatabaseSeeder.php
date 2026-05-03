<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\AdminRoleSeeder;
use Database\Seeders\AdminSeeder;
use Database\Seeders\PropertySeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PropertySeeder::class,
            AdminRoleSeeder::class,
            AdminSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
