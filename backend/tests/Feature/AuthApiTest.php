<?php

namespace Tests\Feature;

use App\Models\Guest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['message', 'user']);
        $this->assertDatabaseHas('guests', ['email' => 'newuser@example.com']);
    }

    public function test_registration_fails_with_invalid_email()
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_guest_can_login_with_valid_credentials()
    {
        $guest = Guest::create([
            'email' => 'testuser@example.com',
            'password_hash' => bcrypt('password123'),
            'first_name' => 'Test',
            'last_name' => 'User',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'testuser@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['access_token', 'refresh_token', 'user']);
    }

    public function test_login_fails_with_invalid_password()
    {
        $guest = Guest::create([
            'email' => 'testuser@example.com',
            'password_hash' => bcrypt('password123'),
            'first_name' => 'Test',
            'last_name' => 'User',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'testuser@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_fails_for_unverified_email()
    {
        Guest::create([
            'email' => 'unverified@example.com',
            'password_hash' => bcrypt('password123'),
            'first_name' => 'Test',
            'last_name' => 'User',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'unverified@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    public function test_can_verify_email_with_valid_token()
    {
        $guest = Guest::create([
            'email' => 'verify@example.com',
            'password_hash' => bcrypt('password123'),
            'first_name' => 'Test',
            'last_name' => 'User',
            'verification_token' => 'valid_token_123',
        ]);

        $response = $this->postJson('/api/auth/verify-email', [
            'token' => 'valid_token_123',
        ]);

        $response->assertStatus(200);
        $this->assertNotNull($guest->fresh()->email_verified_at);
    }

    public function test_cannot_access_protected_routes_without_token()
    {
        $response = $this->getJson('/api/staff');

        $response->assertStatus(401);
    }
}
