<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Client;
use App\Models\Renewal;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class RenewalAccessTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_client_can_view_renewals_for_their_own_asset(): void
    {
        $client = Client::factory()->create();
        $user = User::factory()->client($client)->create();
        $asset = Asset::factory()->create(['project_id' => $client->projects()->create(['name' => 'Proyek Klien'])->id]);
        $renewal = Renewal::factory()->create(['asset_id' => $asset->id]);

        $response = $this->actingAs($user)->getJson("/api/assets/{$asset->id}/renewals");

        $response->assertOk()->assertJsonPath('data.0.id', $renewal->id);
    }

    public function test_authenticated_admin_can_download_an_invoice_pdf(): void
    {
        $user = User::factory()->admin()->create();
        $renewal = Renewal::factory()->create();

        $response = $this->actingAs($user)->get("/api/renewals/{$renewal->id}/invoice/pdf");

        $response->assertOk()->assertHeader('content-type', 'application/pdf');
    }

    public function test_client_cannot_download_another_clients_invoice(): void
    {
        $user = User::factory()->client(Client::factory()->create())->create();
        $renewal = Renewal::factory()->create();

        $response = $this->actingAs($user)->getJson("/api/renewals/{$renewal->id}/invoice/pdf");

        $response->assertForbidden();
    }

    public function test_client_cannot_create_a_renewal_for_their_own_asset(): void
    {
        $client = Client::factory()->create();
        $user = User::factory()->client($client)->create();
        $asset = Asset::factory()->create(['project_id' => $client->projects()->create(['name' => 'Proyek Klien'])->id]);

        $response = $this->actingAs($user)->postJson("/api/assets/{$asset->id}/renewals", [
            'new_expired_date' => now()->addYear()->toDateString(),
        ]);

        $response->assertForbidden();
        $this->assertSame(0, Renewal::query()->count());
    }

    public function test_guest_cannot_view_renewal_history(): void
    {
        $response = $this->getJson('/api/assets/1/renewals');

        $response->assertUnauthorized();
    }

    public function test_client_cannot_view_renewals_for_another_clients_asset(): void
    {
        $user = User::factory()->client(Client::factory()->create())->create();
        $asset = Asset::factory()->create();
        Renewal::factory()->create(['asset_id' => $asset->id]);

        $response = $this->actingAs($user)->getJson("/api/assets/{$asset->id}/renewals");

        $response->assertForbidden();
    }
}
