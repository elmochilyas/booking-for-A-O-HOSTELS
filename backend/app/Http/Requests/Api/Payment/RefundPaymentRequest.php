<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Payment;

use Illuminate\Foundation\Http\FormRequest;

class RefundPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'max:255'],
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Refund reason is required.',
        ];
    }
}
