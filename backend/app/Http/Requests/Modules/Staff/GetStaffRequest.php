<?php

namespace App\Http\Requests\Modules\Staff;

use Illuminate\Foundation\Http\FormRequest;

class GetStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => ['nullable', 'uuid', 'exists:properties,id'],
        ];
    }
}
