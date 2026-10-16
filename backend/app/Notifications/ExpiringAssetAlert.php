<?php

namespace App\Notifications;

use App\Models\Asset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExpiringAssetAlert extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  string  $level  Tingkat alert: h30 | h7 | expired
     */
    public function __construct(
        public Asset $asset,
        public string $level,
    ) {
        $this->onQueue('notifications');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $days = $this->asset->daysUntilExpiry();

        $mail = (new MailMessage)
            ->subject($this->subjectLine())
            ->greeting("Halo {$notifiable->name},")
            ->line($this->bodyLine($days))
            ->line("**Aset:** {$this->asset->name} ({$this->asset->type->label()})")
            ->line("**Proyek:** {$this->asset->project?->name}")
            ->line("**Provider:** {$this->asset->provider}")
            ->line("**Tanggal kedaluwarsa:** {$this->asset->expired_date->format('d M Y')}")
            ->line('**Estimasi biaya perpanjangan:** Rp '.number_format((float) $this->asset->renewal_cost, 0, ',', '.'));

        if ($this->level !== 'expired') {
            $mail->line('Segera lakukan perpanjangan sebelum layanan terhenti.');
        }

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'level' => $this->level,
            'asset_id' => $this->asset->id,
            'asset_name' => $this->asset->name,
            'asset_type' => $this->asset->type->value,
            'project_name' => $this->asset->project?->name,
            'expired_date' => $this->asset->expired_date->toDateString(),
            'days_until_expiry' => $this->asset->daysUntilExpiry(),
            'message' => $this->subjectLine(),
        ];
    }

    private function subjectLine(): string
    {
        return match ($this->level) {
            'h30' => "[H-30] {$this->asset->name} akan kedaluwarsa dalam 30 hari",
            'h7' => "[H-7] {$this->asset->name} akan kedaluwarsa dalam 7 hari!",
            default => "[EXPIRED] {$this->asset->name} telah kedaluwarsa",
        };
    }

    private function bodyLine(int $days): string
    {
        return match ($this->level) {
            'h30' => 'Pengingat awal: aset berikut akan kedaluwarsa dalam 30 hari.',
            'h7' => "Pengingat penting: aset berikut akan kedaluwarsa dalam {$days} hari!",
            default => 'Aset berikut telah melewati tanggal kedaluwarsa dan berstatus EXPIRED.',
        };
    }
}
