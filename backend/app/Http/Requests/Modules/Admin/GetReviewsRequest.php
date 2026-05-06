<?php

namespace App\Http\Requests\Modules\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GetReviewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property' => ['nullable', 'uuid', 'exists:properties,id'],
            'status' => ['nullable', 'string'],
        ];
    }
}
