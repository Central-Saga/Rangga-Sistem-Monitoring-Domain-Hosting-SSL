<?php

namespace App\Http\Requests;

use App\Enums\AssetStatus;
use App\Enums\AssetType;
use App\Enums\BillingCycle;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('asset'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_id' => ['sometimes', 'required', 'integer', Rule::exists('projects', 'id')],
            'type' => ['sometimes', 'required', Rule::enum(AssetType::class)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'provider' => ['nullable', 'string', 'max:255'],
            'renewal_cost' => ['sometimes', 'numeric', 'min:0'],
            'billing_cycle' => ['sometimes', Rule::enum(BillingCycle::class)],
            'start_date' => ['nullable', 'date'],
            'expired_date' => ['sometimes', 'required', 'date'],
            'auto_renew' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::enum(AssetStatus::class)],
            'metadata' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
