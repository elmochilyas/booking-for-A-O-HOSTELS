<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $promotionId = $this->route('id');

        return [
            'code' => ['sometimes', 'string', 'max:50', "unique:promotions,promo_code,{$promotionId}"],
            'description' => ['nullable', 'string'],
            'discount_type' => ['sometimes', 'in:percentage,fixed'],
            'discount_value' => ['sometimes', 'numeric', 'min:0'],
            'property_id' => ['nullable', 'uuid', 'exists:properties,id'],
            'room_type_id' => ['nullable', 'uuid', 'exists:room_types,id'],
            'valid_from' => ['sometimes', 'date'],
            'valid_until' => ['sometimes', 'date', 'after:valid_from'],
            'min_booking_value' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
