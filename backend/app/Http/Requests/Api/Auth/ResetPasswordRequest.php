<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Reset token is required.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }
}
