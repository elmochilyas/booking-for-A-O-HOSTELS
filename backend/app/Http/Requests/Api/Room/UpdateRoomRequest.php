<?php

namespace App\Http\Requests\Api\Room;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\RoomStatus;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'room_number'    => ['sometimes', 'string', 'max:20'],
            'floor'          => ['sometimes', 'integer', 'min:0'],
            'status'         => ['sometimes', Rule::enum(RoomStatus::class)],
            'features'       => ['sometimes', 'array'],
            'features.*'     => ['string', 'max:100'],
            'price_override' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
