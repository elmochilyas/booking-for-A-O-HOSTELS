<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Staff;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
            'property_id' => ['sometimes', 'uuid', 'exists:properties,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required.',
            'password.required' => 'Password is required.',
        ];
    }
}
