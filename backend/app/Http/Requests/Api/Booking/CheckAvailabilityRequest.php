<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Booking;

use Illuminate\Foundation\Http\FormRequest;

class CheckAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => ['required', 'uuid', 'exists:properties,id'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Property is required.',
            'property_id.exists' => 'Selected property does not exist.',
            'check_in.required' => 'Check-in date is required.',
            'check_out.required' => 'Check-out date is required.',
            'check_out.after' => 'Check-out date must be after check-in date.',
        ];
    }
}
