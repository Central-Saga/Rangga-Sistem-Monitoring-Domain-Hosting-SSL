<?php

namespace App\Console\Commands;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\User;
use App\Notifications\ExpiringAssetAlert;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Notifications\DatabaseNotification;

#[Signature('assets:check-expiry')]
#[Description('Periksa aset yang akan kedaluwarsa dan kirim alert berjenjang (H-30, H-7, expired)')]
class CheckAssetExpiry extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Tandai aset yang sudah lewat tanggal kedaluwarsa, meskipun belum ada penerima alert.
        Asset::query()
            ->where('status', AssetStatus::Active->value)
            ->pastDue()
            ->update(['status' => AssetStatus::Expired->value]);

        $recipients = User::query()->whereIn('role', ['admin', 'staff'])->get();

        if ($recipients->isEmpty()) {
            $this->warn('Tidak ada user admin/staff sebagai penerima alert.');

            return self::SUCCESS;
        }

        $sent = ['h30' => 0, 'h7' => 0, 'expired' => 0];

        Asset::query()
            ->with('project')
            ->whereDate('expired_date', '<=', now()->addDays(30)->toDateString())
            ->chunk(100, function ($assets) use ($recipients, &$sent): void {
                foreach ($assets as $asset) {
                    $level = $this->alertLevelFor($asset);

                    if ($level === null || $this->alreadyAlerted($asset, $level)) {
                        continue;
                    }

                    foreach ($recipients as $recipient) {
                        $recipient->notify(new ExpiringAssetAlert($asset, $level));
                    }

                    $sent[$level]++;
                }
            });

        $this->info("Alert terkirim — H-30: {$sent['h30']}, H-7: {$sent['h7']}, Expired: {$sent['expired']}.");

        return self::SUCCESS;
    }

    /**
     * Tentukan tingkat alert berdasarkan sisa hari.
     */
    private function alertLevelFor(Asset $asset): ?string
    {
        $days = $asset->daysUntilExpiry();

        return match (true) {
            $days < 0 => 'expired',
            $days <= 7 => 'h7',
            $days <= 30 => 'h30',
            default => null,
        };
    }

    /**
     * Cegah alert ganda untuk kombinasi aset + level + tanggal expired yang sama.
     */
    private function alreadyAlerted(Asset $asset, string $level): bool
    {
        return DatabaseNotification::query()
            ->where('type', ExpiringAssetAlert::class)
            ->where('data->asset_id', $asset->id)
            ->where('data->level', $level)
            ->where('data->expired_date', $asset->expired_date->toDateString())
            ->exists();
    }
}
