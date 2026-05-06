<?php

namespace App\Http\Requests\Modules\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:staff,email'],
            'password' => ['required', 'string', 'min:8'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'role' => ['nullable', 'string'],
            'admin_role_id' => ['nullable', 'uuid', 'exists:admin_roles,id'],
            'property_id' => ['nullable', 'uuid', 'exists:properties,id'],
            'permissions' => ['nullable', 'array'],
            'assigned_properties' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
            'two_factor_enabled' => ['nullable', 'boolean'],
        ];
    }
}
