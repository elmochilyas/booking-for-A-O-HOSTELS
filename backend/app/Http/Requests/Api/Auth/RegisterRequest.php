<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Auth;

use App\Enums\BookingSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:guests,email'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'date_of_birth' => ['sometimes', 'date', 'before:today'],
            'source' => ['sometimes', Rule::enum(BookingSource::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already registered.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }
}
