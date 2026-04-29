<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\RoomType;
use App\Models\Room;
use App\Models\Amenity;
use App\Models\Extra;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $propertyId = Str::uuid()->toString();

        Property::create([
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
        ]);

        $roomTypes = [
            ['id' => Str::uuid()->toString(), 'name' => 'Single Room', 'capacity' => 1, 'base_price' => 45.00, 'description' => 'Private room with single bed, ideal for solo travelers'],
            ['id' => Str::uuid()->toString(), 'name' => 'Twin/Double Room', 'capacity' => 2, 'base_price' => 65.00, 'description' => 'Private room with double bed or two single beds'],
            ['id' => Str::uuid()->toString(), 'name' => 'Triple Room', 'capacity' => 3, 'base_price' => 85.00, 'description' => 'Private room with three beds'],
            ['id' => Str::uuid()->toString(), 'name' => 'Family Room', 'capacity' => 4, 'base_price' => 120.00, 'description' => 'Large room with double bed and bunk beds, accommodates up to 8'],
            ['id' => Str::uuid()->toString(), 'name' => 'Mixed Dorm', 'capacity' => 8, 'base_price' => 25.00, 'description' => 'Shared dormitory with 8 beds'],
            ['id' => Str::uuid()->toString(), 'name' => 'Female Dorm', 'capacity' => 8, 'base_price' => 28.00, 'description' => 'Female-only shared dormitory'],
            ['id' => Str::uuid()->toString(), 'name' => 'Backpacker Dorm', 'capacity' => 6, 'base_price' => 22.00, 'description' => 'Budget-friendly shared option'],
        ];

        foreach ($roomTypes as $type) {
            $type['property_id'] = $propertyId;
            $type['max_occupancy'] = $type['capacity'];
            $type['amenities'] = json_encode(['WiFi', 'Lockers', 'Lamp']);
            RoomType::create($type);
        }

        $this->createRooms($propertyId, $roomTypes);

        $amenities = [
            ['name' => 'Free WiFi', 'category' => 'internet', 'icon' => 'wifi', 'is_free' => true],
            ['name' => '24-hour Reception', 'category' => 'service', 'icon' => 'clock', 'is_free' => true],
            ['name' => 'Rooftop Bar', 'category' => 'food', 'icon' => 'coffee', 'is_free' => true],
            ['name' => 'Lobby Bar', 'category' => 'food', 'icon' => 'coffee', 'is_free' => true],
            ['name' => 'Games Room', 'category' => 'entertainment', 'icon' => 'gamepad', 'is_free' => true],
            ['name' => 'Breakfast', 'category' => 'food', 'icon' => 'coffee', 'is_free' => false],
            ['name' => 'Kitchen', 'category' => 'kitchen', 'icon' => 'utensils', 'is_free' => true],
            ['name' => 'Parking', 'category' => 'parking', 'icon' => 'car', 'is_free' => false],
            ['name' => 'Bicycle Rental', 'category' => 'rental', 'icon' => 'bike', 'is_free' => false],
            ['name' => 'Luggage Storage', 'category' => 'service', 'icon' => 'suitcase', 'is_free' => true],
            ['name' => 'Laundry', 'category' => 'service', 'icon' => 'shirt', 'is_free' => false],
            ['name' => 'Satellite TV', 'category' => 'entertainment', 'icon' => 'tv', 'is_free' => true],
        ];

        foreach ($amenities as $amenity) {
            $amenity['id'] = Str::uuid()->toString();
            $amenity['property_id'] = $propertyId;
            Amenity::create($amenity);
        }

        $extras = [
            ['name' => 'Towel Rental', 'price' => 2.50, 'price_type' => 'per_stay'],
            ['name' => 'Breakfast Buffet', 'price' => 8.50, 'price_type' => 'per_person'],
            ['name' => 'Parking per Night', 'price' => 12.00, 'price_type' => 'per_night'],
            ['name' => 'Bicycle Rental', 'price' => 8.00, 'price_type' => 'per_day'],
            ['name' => 'Late Check-out', 'price' => 15.00, 'price_type' => 'per_stay'],
            ['name' => 'Early Check-in', 'price' => 15.00, 'price_type' => 'per_stay'],
        ];

        foreach ($extras as $extra) {
            $extra['id'] = Str::uuid()->toString();
            $extra['property_id'] = $propertyId;
            Extra::create($extra);
        }
    }

    private function createRooms(string $propertyId, array $roomTypes): void
    {
        $roomCounts = [
            'Single Room' => 20,
            'Twin/Double Room' => 40,
            'Triple Room' => 30,
            'Family Room' => 20,
            'Mixed Dorm' => 25,
            'Female Dorm' => 15,
            'Backpacker Dorm' => 10,
        ];

        $floor = 1;
        $roomNumber = 100;

        foreach ($roomCounts as $typeName => $count) {
            $roomType = collect($roomTypes)->firstWhere('name', $typeName);
            
            for ($i = 0; $i < $count; $i++) {
                Room::create([
                    'id' => Str::uuid()->toString(),
                    'property_id' => $propertyId,
                    'room_type_id' => $roomType['id'],
                    'room_number' => (string)$roomNumber,
                    'floor' => $floor,
                    'status' => 'available',
                    'window_type' => 'outside',
                ]);
                
                $roomNumber++;
                if ($roomNumber % 100 === 0) {
                    $floor++;
                }
            }
        }
    }
}