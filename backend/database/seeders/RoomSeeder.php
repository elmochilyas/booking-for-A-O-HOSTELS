<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Property;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        DB::table('rooms')->truncate();

        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        $properties = Property::with('roomTypes')->get();

        foreach ($properties as $property) {
            $roomTypes = $property->roomTypes;
            if ($roomTypes->isEmpty()) {
                continue;
            }

            $total = $property->total_rooms;

            // Distribute room counts across room types
            // Mixed Dorm: ~40%, Female Dorm: ~20%, Private: ~30%, Family: ~10%
            $weights = [0.40, 0.20, 0.30, 0.10];
            $roomTypeList = $roomTypes->values();
            $counts = [];
            $assigned = 0;

            foreach ($roomTypeList as $i => $rt) {
                $weight = $weights[$i] ?? (1 / $roomTypeList->count());
                $count = (int) round($total * $weight, 0);
                $counts[$i] = $count;
                $assigned += $count;
            }

            // Fix rounding diff on last type
            $diff = $total - $assigned;
            if (isset($counts[0])) {
                $counts[0] += $diff;
            }

            $rooms = [];
            foreach ($roomTypeList as $i => $roomType) {
                $count = $counts[$i] ?? 0;
                for ($n = 1; $n <= $count; $n++) {
                    $floor = (int) ceil($n / 20); // ~20 rooms per floor
                    $rooms[] = [
                        'id' => Str::uuid()->toString(),
                        'property_id' => $property->id,
                        'room_type_id' => $roomType->id,
                        'room_number' => strtoupper(substr($roomType->name, 0, 1)).str_pad((string) $n, 3, '0', STR_PAD_LEFT),
                        'floor' => $floor,
                        'status' => 'available',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            DB::table('rooms')->insert($rooms);
        }

        $total = Room::count();
        $this->command->info("Seeded {$total} rooms across {$properties->count()} properties.");
    }
}
