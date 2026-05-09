<?php

declare(strict_types=1);

namespace App\Http\Requests\Modules\Bookings;

use Illuminate\Foundation\Http\FormRequest;

class CheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'room_id' => ['nullable', 'uuid'],
        ];
    }
}
