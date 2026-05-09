<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Room;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'room_number' => ['sometimes', 'string', 'max:20'],
            'floor' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', Rule::in(['available', 'booked', 'maintenance', 'cleaning'])],
        ];
    }
}
