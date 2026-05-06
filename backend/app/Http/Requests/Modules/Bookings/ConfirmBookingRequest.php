<?php

namespace App\Http\Requests\Modules\Bookings;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // No specific rules for confirm - just the booking ID from route
        ];
    }
}
