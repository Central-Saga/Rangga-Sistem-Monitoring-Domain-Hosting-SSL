<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class AuthRegisterTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_register_creates_a_client_user_and_issues_a_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Pelanggan Baru',
            'email' => 'baru@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'baru@example.com')
            ->assertJsonPath('user.role', 'client')
            ->assertJsonStructure(['token', 'user']);

        $user = User::query()->where('email', 'baru@example.com')->firstOrFail();
        $this->assertSame(UserRole::Client, $user->role);
        $this->assertCount(1, $user->tokens);
    }

    public function test_register_rejects_an_email_that_is_already_taken(): void
    {
        User::factory()->create(['email' => 'admin@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Duplikat',
            'email' => 'admin@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->assertSame(1, User::query()->count());
    }

    public function test_register_requires_name_email_and_password(): void
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_register_rejects_a_mismatched_password_confirmation(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Pelanggan Baru',
            'email' => 'baru@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'berbeda123',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['password']);
        $this->assertGuest();
    }
}
