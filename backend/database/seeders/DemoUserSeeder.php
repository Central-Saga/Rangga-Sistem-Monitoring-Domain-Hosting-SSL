<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUserSeeder extends Seeder
{
    /**
     * Buat akun demo seragam untuk tiap role (admin, staff, client).
     * Password semua akun: "password".
     */
    public function run(): void
    {
        $client = Client::query()->first() ?? Client::factory()->create();

        $accounts = [
            ['name' => 'Admin Monitoring', 'email' => 'admin@example.com', 'role' => UserRole::Admin, 'client_id' => null],
            ['name' => 'Staff Monitoring', 'email' => 'staff@example.com', 'role' => UserRole::Staff, 'client_id' => null],
            ['name' => 'Client Demo', 'email' => 'client@example.com', 'role' => UserRole::Client, 'client_id' => $client->id],
        ];

        foreach ($accounts as $account) {
            User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => 'password',
                    'role' => $account['role'],
                    'client_id' => $account['client_id'],
                ],
            );
        }
    }
}
