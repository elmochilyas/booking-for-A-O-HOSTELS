<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Staff;

use Illuminate\Foundation\Http\FormRequest;

class LoginStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
