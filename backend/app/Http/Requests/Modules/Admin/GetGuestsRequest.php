<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GetGuestsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string'],
            'is_loyalty_member' => ['nullable', 'boolean'],
            'is_banned' => ['nullable', 'boolean'],
        ];
    }
}
