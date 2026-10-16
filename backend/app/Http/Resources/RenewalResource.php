<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RenewalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'renewed_by' => $this->renewed_by,
            'renewed_by_name' => $this->renewedBy?->name,
            'renewal_date' => $this->renewal_date?->toDateString(),
            'previous_expired_date' => $this->previous_expired_date?->toDateString(),
            'new_expired_date' => $this->new_expired_date?->toDateString(),
            'cost' => $this->cost,
            'invoice_number' => $this->invoice_number,
            'payment_method' => $this->payment_method,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'notes' => $this->notes,
            'asset' => new AssetResource($this->whenLoaded('asset')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
