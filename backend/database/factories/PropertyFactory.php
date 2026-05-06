<?php>

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company() . ' Hotel',
            'location' => $this->faker->city(),
            'address' => $this->faker->address(),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'check_in_time' => '15:00:00',
            'check_out_time' => '10:00:00',
            'total_rooms' => $this->faker->numberBetween(10, 100),
            'description' => $this->faker->paragraph(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->safeEmail(),
            'images' => json_encode([]),
            'rating' => $this->faker->randomFloat(1, 3, 5),
            'review_count' => $this->faker->numberBetween(0, 1000),
        ];
    }
}
