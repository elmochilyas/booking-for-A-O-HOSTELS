<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Properties;

use Illuminate\Foundation\Http\FormRequest;

class GetPropertiesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'location' => ['nullable', 'string'],
        ];
    }
}
