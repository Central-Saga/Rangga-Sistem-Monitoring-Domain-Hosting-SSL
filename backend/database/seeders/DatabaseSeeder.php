<?php

namespace Database\Seeders;

use App\Enums\AssetStatus;
use App\Enums\AssetType;
use App\Models\Asset;
use App\Models\Client;
use App\Models\Project;
use App\Models\Renewal;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Bersihkan data lama lebih dulu (urutan mengikuti foreign key) agar
        // seeder aman dijalankan berulang kali tanpa error unique/pk.
        Renewal::query()->delete();
        Asset::query()->forceDelete();
        Project::query()->forceDelete();
        User::query()->delete();
        Client::query()->forceDelete();

        $admin = User::factory()->admin()->create([
            'name' => 'Admin Monitoring',
            'email' => 'admin@example.com',
        ]);

        $staffMembers = User::factory()->staff()->count(2)->create();

        $clients = Client::factory()->count(5)->create();

        foreach ($clients as $client) {
            $projects = Project::factory()->count(fake()->numberBetween(1, 3))->create([
                'client_id' => $client->id,
            ]);

            foreach ($projects as $project) {
                foreach (AssetType::cases() as $type) {
                    Asset::factory()->create([
                        'project_id' => $project->id,
                        'type' => $type,
                        'expired_date' => fake()->randomElement([
                            now()->subDays(fake()->numberBetween(1, 20)),
                            now()->addDays(fake()->numberBetween(1, 7)),
                            now()->addDays(fake()->numberBetween(8, 30)),
                            now()->addDays(fake()->numberBetween(31, 180)),
                        ]),
                    ]);
                }
            }

            User::factory()->client($client)->create([
                'email' => 'client'.$client->id.'@example.com',
            ]);
        }

        // Riwayat perpanjangan untuk beberapa aset.
        Asset::query()->inRandomOrder()->limit(10)->get()->each(function (Asset $asset) use ($admin, $staffMembers): void {
            Renewal::factory()->count(fake()->numberBetween(1, 3))->create([
                'asset_id' => $asset->id,
                'renewed_by' => fake()->randomElement([$admin, ...$staffMembers])->id,
                'cost' => $asset->renewal_cost,
            ]);
        });

        // Tandai aset yang sudah lewat tanggal kedaluwarsa.
        Asset::query()->pastDue()->update(['status' => AssetStatus::Expired->value]);

        // Akun demo seragam untuk tiap role.
        $this->call(DemoUserSeeder::class);
    }
}
