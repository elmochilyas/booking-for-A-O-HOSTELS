<?php

namespace App\Http\Requests\Api\Room;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\RoomStatus;

class CreateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id'    => ['required', 'uuid', 'exists:properties,id'],
            'room_type_id'   => ['required', 'uuid', 'exists:room_types,id'],
            'room_number'    => ['required', 'string', 'max:20'],
            'floor'          => ['sometimes', 'integer', 'min:0'],
            'status'         => ['sometimes', Rule::enum(RoomStatus::class)],
            'features'       => ['sometimes', 'array'],
            'features.*'     => ['string', 'max:100'],
            'price_override' => ['sometimes', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required'  => 'Property is required.',
            'room_type_id.required' => 'Room type is required.',
            'room_number.required'  => 'Room number is required.',
        ];
    }
}
