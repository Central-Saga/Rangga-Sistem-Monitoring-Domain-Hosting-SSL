<?php

namespace App\Http\Requests;

use App\Enums\RenewalStatus;
use App\Models\Renewal;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRenewalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Renewal::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'renewal_date' => ['sometimes', 'date'],
            'new_expired_date' => ['required', 'date'],
            'cost' => ['sometimes', 'numeric', 'min:0'],
            'invoice_number' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'status' => ['sometimes', Rule::enum(RenewalStatus::class)],
            'notes' => ['nullable', 'string'],
        ];
    }
}
