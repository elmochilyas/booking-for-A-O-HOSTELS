<?php

namespace App\Http\Requests\Modules\Properties;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'location' => ['sometimes', 'string', 'max:255'],
            'address' => ['sometimes', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'check_in_time' => ['sometimes'],
            'check_out_time' => ['sometimes'],
            'total_rooms' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
