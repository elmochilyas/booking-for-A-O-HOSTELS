<?php

namespace App\Http\Requests\Modules\Bookings;

use Illuminate\Foundation\Http\FormRequest;

class CancelBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // No specific rules for cancel - just the booking ID from route
        ];
    }
}
