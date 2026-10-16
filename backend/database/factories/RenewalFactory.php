<?php

namespace Database\Factories;

use App\Enums\RenewalStatus;
use App\Models\Asset;
use App\Models\Renewal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Renewal>
 */
class RenewalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $previousExpired = fake()->dateTimeBetween('-1 year', '-1 month');
        $newExpired = (clone $previousExpired)->modify('+1 year');

        return [
            'asset_id' => Asset::factory(),
            'renewed_by' => User::factory(),
            'renewal_date' => fake()->dateTimeBetween('-1 month', 'now'),
            'previous_expired_date' => $previousExpired,
            'new_expired_date' => $newExpired,
            'cost' => fake()->randomElement([150000, 250000, 500000, 1200000]),
            'invoice_number' => 'INV-'.fake()->unique()->numerify('######'),
            'payment_method' => fake()->randomElement(['transfer', 'qris', 'kartu_kredit']),
            'status' => fake()->randomElement(RenewalStatus::cases()),
        ];
    }
}
