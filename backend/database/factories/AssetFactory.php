<?php

namespace Database\Factories;

use App\Enums\AssetStatus;
use App\Enums\AssetType;
use App\Enums\BillingCycle;
use App\Models\Asset;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Asset>
 */
class AssetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(AssetType::cases());

        return [
            'project_id' => Project::factory(),
            'type' => $type,
            'name' => fn (array $attributes): string => $this->nameForType(AssetType::from($attributes['type'] instanceof AssetType ? $attributes['type']->value : $attributes['type'])),
            'provider' => fake()->randomElement(['Niagahoster', 'IDCloudHost', 'Cloudflare', 'DigitalOcean', 'AWS', 'Rumahweb', 'Exabytes']),
            'renewal_cost' => fake()->randomElement([150000, 250000, 500000, 750000, 1200000, 2500000]),
            'billing_cycle' => fake()->randomElement(BillingCycle::cases()),
            'start_date' => fake()->dateTimeBetween('-2 years', '-1 month'),
            'expired_date' => fake()->dateTimeBetween('-15 days', '+60 days'),
            'auto_renew' => fake()->boolean(20),
            'status' => AssetStatus::Active,
            'metadata' => fn (array $attributes): ?array => $this->metadataForType(AssetType::from($attributes['type'] instanceof AssetType ? $attributes['type']->value : $attributes['type'])),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function metadataForType(AssetType $type): ?array
    {
        return match ($type) {
            AssetType::Domain => [
                'registrar' => fake()->company(),
                'nameservers' => ['ns1.'.fake()->domainName(), 'ns2.'.fake()->domainName()],
            ],
            AssetType::Hosting => [
                'panel_url' => 'https://'.fake()->domainName().'/cpanel',
                'disk_quota_gb' => fake()->numberBetween(5, 100),
            ],
            AssetType::Ssl => [
                'issuer' => fake()->randomElement(["Let's Encrypt", 'Sectigo', 'DigiCert']),
                'wildcard' => fake()->boolean(20),
            ],
            AssetType::Vps => [
                'ip_address' => fake()->ipv4(),
                'os' => fake()->randomElement(['Ubuntu 24.04', 'Debian 12', 'AlmaLinux 9']),
                'cpu_cores' => fake()->numberBetween(1, 8),
                'ram_gb' => fake()->randomElement([2, 4, 8, 16]),
            ],
        };
    }

    private function nameForType(AssetType $type): string
    {
        return match ($type) {
            AssetType::Domain => fake()->domainName(),
            AssetType::Hosting => 'Hosting '.fake()->domainName(),
            AssetType::Ssl => 'SSL '.fake()->domainName(),
            AssetType::Vps => 'VPS '.fake()->words(2, true),
        };
    }
}
