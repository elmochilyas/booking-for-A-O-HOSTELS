<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Report;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(['occupancy', 'revenue', 'guest', 'staff'])],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'property_id' => ['sometimes', 'uuid', 'exists:properties,id'],
            'group_by' => ['sometimes', 'string', Rule::in(['day', 'week', 'month'])],
            'format' => ['sometimes', 'string', Rule::in(['json', 'csv', 'pdf'])],
        ];
    }
}
