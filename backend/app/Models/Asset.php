<?php

namespace App\Models;

use App\Enums\AssetStatus;
use App\Enums\AssetType;
use App\Enums\BillingCycle;
use Database\Factories\AssetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['project_id', 'type', 'name', 'provider', 'renewal_cost', 'billing_cycle', 'start_date', 'expired_date', 'auto_renew', 'status', 'metadata', 'notes'])]
class Asset extends Model
{
    /** @use HasFactory<AssetFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AssetType::class,
            'status' => AssetStatus::class,
            'billing_cycle' => BillingCycle::class,
            'renewal_cost' => 'decimal:2',
            'start_date' => 'date',
            'expired_date' => 'date',
            'auto_renew' => 'boolean',
            'metadata' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Project, Asset>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * @return HasMany<Renewal>
     */
    public function renewals(): HasMany
    {
        return $this->hasMany(Renewal::class);
    }

    /**
     * Sisa hari menuju kedaluwarsa (negatif berarti sudah lewat).
     */
    public function daysUntilExpiry(): int
    {
        return (int) now()->startOfDay()->diffInDays($this->expired_date, false);
    }

    /**
     * Scope aset yang akan kedaluwarsa dalam rentang hari tertentu.
     *
     * @param  Builder<Asset>  $query
     */
    #[Scope]
    protected function expiringWithin(Builder $query, int $days): void
    {
        $query->where('status', AssetStatus::Active->value)
            ->whereDate('expired_date', '<=', now()->addDays($days)->toDateString());
    }

    /**
     * Scope aset yang sudah melewati tanggal kedaluwarsa.
     *
     * @param  Builder<Asset>  $query
     */
    #[Scope]
    protected function pastDue(Builder $query): void
    {
        $query->whereDate('expired_date', '<', now()->toDateString());
    }
}
