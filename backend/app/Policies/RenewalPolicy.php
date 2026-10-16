<?php

namespace App\Policies;

use App\Models\Renewal;
use App\Models\User;

class RenewalPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Renewal $renewal): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->isClient() && $user->client_id === $renewal->asset?->project?->client_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isStaff();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Renewal $renewal): bool
    {
        return $user->isAdmin() || $user->isStaff();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Renewal $renewal): bool
    {
        return $user->isAdmin();
    }
}
