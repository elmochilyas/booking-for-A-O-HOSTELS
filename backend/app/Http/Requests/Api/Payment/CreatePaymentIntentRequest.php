<?php

namespace App\Http\Requests\Api\Payment;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePaymentIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_id'       => ['required', 'uuid', 'exists:bookings,id'],
            'amount'            => ['required', 'numeric', 'min:1'],
            'payment_method'    => ['required', Rule::enum(PaymentMethod::class)],
            'deposit_percentage' => ['sometimes', 'integer', 'min:20', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required'       => 'Booking is required.',
            'booking_id.exists'          => 'Selected booking does not exist.',
            'amount.required'            => 'Payment amount is required.',
            'amount.numeric'             => 'Amount must be a number.',
            'amount.min'                 => 'Amount must be at least 1.',
            'payment_method.required'    => 'Payment method is required.',
            'deposit_percentage.min'  => 'Deposit percentage must be at least 20%.',
            'deposit_percentage.max'  => 'Deposit percentage cannot exceed 100%.',
        ];
    }
}
