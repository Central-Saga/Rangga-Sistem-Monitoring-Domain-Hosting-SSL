<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-2 years', '-1 month');

        return [
            'client_id' => Client::factory(),
            'name' => 'Website '.fake()->company(),
            'description' => fake()->sentence(),
            'status' => fake()->randomElement(ProjectStatus::cases()),
            'start_date' => $startDate,
            'end_date' => fake()->optional(0.3)->dateTimeBetween('now', '+1 year'),
        ];
    }
}
