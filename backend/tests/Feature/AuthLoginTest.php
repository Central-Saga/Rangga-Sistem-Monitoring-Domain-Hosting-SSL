<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_login_issues_a_sanctum_token_for_valid_credentials(): void
    {
        $user = User::factory()->admin()->create(['email' => 'admin@example.com']);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonPath('user.id', $user->id)->assertJsonStructure(['token']);
        $this->assertCount(1, $user->tokens);
    }

    public function test_login_rejects_missing_credentials_with_validation_errors(): void
    {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);
    }
}
