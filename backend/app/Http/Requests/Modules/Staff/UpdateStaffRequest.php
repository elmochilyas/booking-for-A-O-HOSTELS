<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Staff;

use App\Enums\StaffRole;
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
            'role' => ['sometimes', Rule::enum(StaffRole::class)],
            'property_id' => ['nullable', 'uuid', 'exists:properties,id'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
