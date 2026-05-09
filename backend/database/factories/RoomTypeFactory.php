<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomTypeFactory extends Factory
{
    protected $model = RoomType::class;

    public function definition(): array
    {
        return [
            'property_id' => null, // Must be set when using
            'name' => $this->faker->word().' Room',
            'capacity' => $this->faker->numberBetween(1, 4),
            'base_price' => $this->faker->randomFloat(2, 50, 300),
            'description' => $this->faker->paragraph(),
            'images' => json_encode([]),
            'amenities' => json_encode([]),
            'max_occupancy' => $this->faker->numberBetween(1, 6),
        ];
    }
}
