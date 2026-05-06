<?php

namespace App\Http\Requests\Modules\Payments;

use Illuminate\Foundation\Http\FormRequest;

class GetPaymentBreakdownRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'total_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
