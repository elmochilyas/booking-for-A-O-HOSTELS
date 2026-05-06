<?php>

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            'guest_id' => null, // Must be set when using
            'property_id' => null, // Must be set when using
            'room_type_id' => null, // Must be set when using
            'check_in_date' => now()->addDay(),
            'check_out_date' => now()->addDays(3),
            'guest_count' => $this->faker->numberBetween(1, 4),
            'total_price' => $this->faker->randomFloat(2, 50, 500),
            'status' => 'confirmed',
        ];
    }
}
