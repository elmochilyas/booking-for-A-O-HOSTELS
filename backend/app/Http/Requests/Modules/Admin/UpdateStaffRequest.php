<?php

namespace App\Http\Requests\Modules\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $staffId = $this->route('id');

        return [
            'email' => ['sometimes', 'email', Rule::unique('staff', 'email')->ignore($staffId)],
            'password' => ['sometimes', 'string', 'min:8'],
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'role' => ['sometimes', 'string'],
            'admin_role_id' => ['nullable', 'uuid', 'exists:admin_roles,id'],
            'property_id' => ['nullable', 'uuid', 'exists:properties,id'],
            'permissions' => ['nullable', 'array'],
            'assigned_properties' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
            'two_factor_enabled' => ['nullable', 'boolean'],
        ];
    }
}
