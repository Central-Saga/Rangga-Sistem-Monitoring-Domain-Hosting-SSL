<?php

namespace App\Models;

use App\Enums\RenewalStatus;
use Database\Factories\RenewalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['asset_id', 'renewed_by', 'renewal_date', 'previous_expired_date', 'new_expired_date', 'cost', 'invoice_number', 'payment_method', 'status', 'notes'])]
class Renewal extends Model
{
    /** @use HasFactory<RenewalFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => RenewalStatus::class,
            'renewal_date' => 'date',
            'previous_expired_date' => 'date',
            'new_expired_date' => 'date',
            'cost' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Asset, Renewal>
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * @return BelongsTo<User, Renewal>
     */
    public function renewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'renewed_by');
    }
}
