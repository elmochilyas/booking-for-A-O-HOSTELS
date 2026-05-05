<?php

namespace App\Http\Requests\Api\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\PaymentMethod;

class CreatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_id'     => ['required', 'uuid', 'exists:bookings,id'],
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'payment_details' => ['sometimes', 'array'],
            'payment_details.card_token'  => ['required_if:payment_method,card', 'string'],
            'payment_details.card_last4'  => ['sometimes', 'string', 'size:4'],
            'payment_details.stripe_charge_id' => ['sometimes', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required' => 'Booking is required.',
            'booking_id.exists'    => 'Selected booking does not exist.',
            'amount.required'     => 'Payment amount is required.',
            'amount.min'          => 'Amount must be greater than 0.',
            'payment_method.required' => 'Payment method is required.',
        ];
    }
}
