<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $propertyId = Str::uuid()->toString();

        DB::table('properties')->insert([
            'id' => $propertyId,
            'name' => 'A&O Berlin Hauptbahnhof',
            'location' => 'Berlin',
            'address' => 'Lehrter Str. 17, 10557 Berlin, Germany',
            'latitude' => 52.5258,
            'longitude' => 13.3235,
            'check_in_time' => '15:00:00',
            'check_out_time' => '10:00:00',
            'total_rooms' => 160,
            'description' => 'Modern hostel located in the heart of Berlin, just 5-10 minutes walk from Hauptbahnhof main station and Brandenburg Gate.',
            'phone' => '+49 30 12345678',
            'email' => 'berlin.hauptbahnhof@ao-hostels.com',
            'rating' => 4.3,
            'review_count' => 5847,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $roomTypes = [
            ['name' => 'Single Room', 'capacity' => 1, 'base_price' => 45.00],
            ['name' => 'Twin/Double Room', 'capacity' => 2, 'base_price' => 65.00],
            ['name' => 'Triple Room', 'capacity' => 3, 'base_price' => 85.00],
            ['name' => 'Family Room', 'capacity' => 4, 'base_price' => 120.00],
            ['name' => 'Mixed Dorm', 'capacity' => 8, 'base_price' => 25.00],
            ['name' => 'Female Dorm', 'capacity' => 8, 'base_price' => 28.00],
            ['name' => 'Backpacker Dorm', 'capacity' => 6, 'base_price' => 22.00],
        ];

        $roomIds = [];
        foreach ($roomTypes as $type) {
            $roomTypeId = Str::uuid()->toString();
            $roomIds[] = $roomTypeId;
            
            DB::table('room_types')->insert([
                'id' => $roomTypeId,
                'property_id' => $propertyId,
                'name' => $type['name'],
                'capacity' => $type['capacity'],
                'base_price' => $type['base_price'],
                'description' => 'Room type ' . $type['name'],
                'max_occupancy' => $type['capacity'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $counter = 100;
        foreach ($roomIds as $index => $typeId) {
            $count = $index < 4 ? 20 : ($index < 5 ? 25 : ($index < 6 ? 15 : 10));
            for ($i = 0; $i < $count; $i++) {
                DB::table('rooms')->insert([
                    'id' => Str::uuid()->toString(),
                    'property_id' => $propertyId,
                    'room_type_id' => $typeId,
                    'room_number' => (string)$counter,
                    'floor' => (int)($counter / 100),
                    'status' => 'available',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $counter++;
            }
        }

        $amenities = [
            ['name' => 'Free WiFi', 'category' => 'internet', 'icon' => 'wifi', 'is_free' => true],
            ['name' => '24-hour Reception', 'category' => 'service', 'icon' => 'clock', 'is_free' => true],
            ['name' => 'Rooftop Bar', 'category' => 'food', 'icon' => 'coffee', 'is_free' => true],
            ['name' => 'Lobby Bar', 'category' => 'food', 'icon' => 'coffee', 'is_free' => true],
            ['name' => 'Games Room', 'category' => 'entertainment', 'icon' => 'gamepad', 'is_free' => true],
            ['name' => 'Breakfast', 'category' => 'food', 'icon' => 'coffee', 'is_free' => false],
            ['name' => 'Kitchen', 'category' => 'kitchen', 'icon' => 'utensils', 'is_free' => true],
            ['name' => 'Parking', 'category' => 'parking', 'icon' => 'car', 'is_free' => false],
        ];

        foreach ($amenities as $amenity) {
            DB::table('amenities')->insert([
                'id' => Str::uuid()->toString(),
                'property_id' => $propertyId,
                'name' => $amenity['name'],
                'category' => $amenity['category'],
                'icon' => $amenity['icon'],
                'is_free' => $amenity['is_free'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $extras = [
            ['name' => 'Towel Rental', 'price' => 2.50, 'price_type' => 'per_stay'],
            ['name' => 'Breakfast Buffet', 'price' => 8.50, 'price_type' => 'per_person'],
            ['name' => 'Parking', 'price' => 12.00, 'price_type' => 'per_night'],
            ['name' => 'Bicycle Rental', 'price' => 8.00, 'price_type' => 'per_stay'],
        ];

        foreach ($extras as $extra) {
            DB::table('extras')->insert([
                'id' => Str::uuid()->toString(),
                'property_id' => $propertyId,
                'name' => $extra['name'],
                'price' => $extra['price'],
                'price_type' => $extra['price_type'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('staff')->insert([
            'id' => Str::uuid()->toString(),
            'email' => 'admin@ao-hostels.com',
            'password_hash' => bcrypt('password123'),
            'first_name' => 'Anna',
            'last_name' => 'Mueller',
            'role' => 'manager',
            'property_id' => $propertyId,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Property seeded successfully!');
        $this->command->info('Staff login: admin@ao-hostels.com / password123');
    }
}