<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Payments;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'uuid', 'exists:bookings,id'],
            'is_deposit' => ['nullable', 'boolean'],
        ];
    }
}
