<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSystemConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:100'],
            'value' => ['required'],
            'type' => ['nullable', 'in:string,boolean,integer,float,json'],
            'category' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_encrypted' => ['nullable', 'boolean'],
        ];
    }
}
