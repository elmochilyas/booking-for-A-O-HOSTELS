<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Properties;

use Illuminate\Foundation\Http\FormRequest;

class CreatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'check_in_time' => ['required'],
            'check_out_time' => ['required'],
            'total_rooms' => ['required', 'integer', 'min:1'],
        ];
    }
}
