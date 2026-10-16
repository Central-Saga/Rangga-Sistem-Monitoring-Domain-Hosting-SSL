<?php

namespace Tests\Feature;

use App\Enums\AssetType;
use App\Models\Asset;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class DashboardSummaryTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_cached_asset_counts_remain_scoped_to_the_current_client(): void
    {
        $firstClient = Client::factory()->create();
        $firstUser = User::factory()->client($firstClient)->create();
        $secondClient = Client::factory()->create();
        $secondUser = User::factory()->client($secondClient)->create();
        Asset::factory()->create([
            'project_id' => $firstClient->projects()->create(['name' => 'Proyek Pertama'])->id,
            'type' => AssetType::Domain,
        ]);

        $firstResponse = $this->actingAs($firstUser)->getJson('/api/dashboard/summary');
        $secondResponse = $this->actingAs($secondUser)->getJson('/api/dashboard/summary');

        $firstResponse->assertOk()->assertJsonPath('summary.assets_by_type.domain', 1);
        $secondResponse->assertOk()->assertJsonPath('summary.assets_by_type', []);
    }
}
