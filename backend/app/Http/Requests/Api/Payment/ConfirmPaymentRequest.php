<?php

namespace App\Http\Requests\Api\Payment;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_id' => ['required', 'uuid', 'exists:payments,id'],
            'payment_intent_id' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_id.required' => 'Payment is required.',
            'payment_id.exists' => 'Payment not found.',
            'payment_intent_id.required' => 'Payment intent ID is required.',
        ];
    }
}
