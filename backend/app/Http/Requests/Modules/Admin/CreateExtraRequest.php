<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateExtraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'price_type' => ['required', 'in:per_stay,per_night,per_person'],
            'property_id' => ['nullable', 'uuid', 'exists:properties,id'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
