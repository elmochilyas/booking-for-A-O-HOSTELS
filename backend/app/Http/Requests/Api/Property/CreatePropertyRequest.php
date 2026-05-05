<?php

namespace App\Http\Requests\Api\Property;

use Illuminate\Foundation\Http\FormRequest;

class CreatePropertyRequest extends FormRequest'
{
    public function authorize(): bool'
    {
        return true;
    }

    public function rules(): array'
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'check_in_time' => ['required', 'date_format:H:i'],
            'check_out_time' => ['required', 'date_format:H:i'],
            'total_rooms' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email'],
        ];
    }

    public function messages(): array'
    {
        return [
            'name.required' => 'Property name is required.',
            'location.required' => 'Location is required.',
            'address.required' => 'Address is required.',
            'check_in_time.required' => 'Check-in time is required.',
            'check_out_time.required' => 'Check-out time is required.',
            'total_rooms.required' => 'Total rooms is required.',
            'total_rooms.min' => 'Total rooms must be at least 1.',
        ];
    }
}
