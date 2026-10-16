<?php

namespace Tests\Feature;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\User;
use App\Notifications\ExpiringAssetAlert;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AssetExpiryAlertTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_expired_assets_are_marked_even_without_alert_recipients(): void
    {
        $this->travelTo(Carbon::parse('2026-10-07 09:00:00'));
        $asset = Asset::factory()->create([
            'status' => AssetStatus::Active,
            'expired_date' => now()->subDay(),
        ]);

        $this->artisan('assets:check-expiry')->assertSuccessful();

        $this->assertSame(AssetStatus::Expired, $asset->fresh()->status);
    }

    public function test_due_assets_send_the_correct_alert_levels(): void
    {
        $this->travelTo(Carbon::parse('2026-10-07 09:00:00'));
        $admin = User::factory()->admin()->create();
        $h30Asset = Asset::factory()->create(['expired_date' => now()->addDays(30)]);
        $h7Asset = Asset::factory()->create(['expired_date' => now()->addDays(7)]);
        Notification::fake();

        $this->artisan('assets:check-expiry')->assertSuccessful();

        Notification::assertSentTo($admin, function (ExpiringAssetAlert $notification) use ($h30Asset): bool {
            return $notification->asset->id === $h30Asset->id && $notification->level === 'h30';
        });
        Notification::assertSentTo($admin, function (ExpiringAssetAlert $notification) use ($h7Asset): bool {
            return $notification->asset->id === $h7Asset->id && $notification->level === 'h7';
        });
    }
}
