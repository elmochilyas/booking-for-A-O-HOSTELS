<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Staff;

use Illuminate\Foundation\Http\FormRequest;

class ToggleActiveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // No specific rules - just the staff ID from route
        ];
    }
}
