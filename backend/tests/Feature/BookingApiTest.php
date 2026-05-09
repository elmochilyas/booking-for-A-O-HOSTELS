<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Guest;
use App\Models\Property;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    protected Property $property;

    protected RoomType $roomType;

    protected function setUp(): void
    {
        parent::setUp();
        Event::fake();

        $property = Property::create([
            'name' => 'A&O Berlin Hauptbahnhof',
            'location' => 'Berlin',
            'address' => 'Kirchstraße 1',
            'check_in_time' => '15:00',
            'check_out_time' => '10:00',
            'total_rooms' => 100,
        ]);

        $roomType = RoomType::create([
            'property_id' => $property->id,
            'name' => 'Double Room',
            'capacity' => 2,
            'base_price' => 65.00,
        ]);

        Room::create([
            'property_id' => $property->id,
            'room_type_id' => $roomType->id,
            'room_number' => '101',
            'floor' => 1,
            'status' => 'available',
        ]);

        $this->roomType = $roomType;
        $this->property = $property;
    }

    public function test_search_availability_returns_available_rooms()
    {
        $response = $this->getJson('/api/bookings/availability?property_id='.$this->property->id.'&check_in=2026-06-01&check_out=2026-06-03');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data']);
    }

    public function test_create_booking_requires_authentication()
    {
        $response = $this->postJson('/api/bookings', [
            'property_id' => $this->property->id,
            'room_type_id' => $this->roomType->id,
            'check_in_date' => '2026-06-01',
            'check_out_date' => '2026-06-03',
            'guest_count' => 2,
        ]);

        $response->assertStatus(401);
    }

    public function test_booking_creation_with_valid_data()
    {
        $guest = Guest::create([
            'email' => 'test@example.com',
            'password_hash' => bcrypt('password'),
            'first_name' => 'Test',
            'last_name' => 'User',
            'email_verified_at' => now(),
        ]);

        $token = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ])->json()['access_token'];

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/bookings', [
                'guest_id' => $guest->id,
                'property_id' => $this->property->id,
                'room_type_id' => $this->roomType->id,
                'check_in_date' => '2026-06-01',
                'check_out_date' => '2026-06-03',
                'guest_count' => 2,
            ]);

        $response->assertStatus(201);
    }

    public function test_cannot_create_booking_for_unavailable_dates()
    {
        $guest = Guest::create([
            'email' => 'test2@example.com',
            'password_hash' => bcrypt('password'),
            'first_name' => 'Test2',
            'last_name' => 'User',
            'email_verified_at' => now(),
        ]);

        Booking::create([
            'guest_id' => $guest->id,
            'property_id' => $this->property->id,
            'room_type_id' => $this->roomType->id,
            'check_in_date' => '2026-06-01',
            'check_out_date' => '2026-06-03',
            'guest_count' => 2,
            'total_price' => 130,
            'status' => 'confirmed',
        ]);

        $guest2 = Guest::create([
            'email' => 'test3@example.com',
            'password_hash' => bcrypt('password'),
            'first_name' => 'Test3',
            'last_name' => 'User',
            'email_verified_at' => now(),
        ]);

        $token = $this->postJson('/api/auth/login', [
            'email' => 'test3@example.com',
            'password' => 'password',
        ])->json()['access_token'];

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/bookings', [
                'guest_id' => $guest2->id,
                'property_id' => $this->property->id,
                'room_type_id' => $this->roomType->id,
                'check_in_date' => '2026-06-01',
                'check_out_date' => '2026-06-03',
                'guest_count' => 2,
            ]);

        $response->assertStatus(400);
    }
}
