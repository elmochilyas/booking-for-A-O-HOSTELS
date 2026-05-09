<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Admin;

use App\Enums\ReviewStatus;
use Illuminate\Foundation\Http\FormRequest;

class ModerateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string'], // ReviewStatus enum when available
            'reply' => ['nullable', 'string'],
        ];
    }
}
