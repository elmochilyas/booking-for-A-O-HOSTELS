<?php

namespace App\Http\Requests\Api\Room;

use Illuminate\Foundation\Http\FormRequest;

class CreateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => ['required', 'uuid', 'exists:properties,id'],
            'room_type_id' => ['required', 'uuid', 'exists:room_types,id'],
            'room_number' => ['required', 'string', 'max:20'],
            'floor' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', Rule::in(['available', 'booked', 'maintenance', 'cleaning'])],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Property is required.',
            'property_id.exists' => 'Property not found.',
            'room_type_id.required' => 'Room type is required.',
            'room_type_id.exists' => 'Room type not found.',
            'room_number.required' => 'Room number is required.',
            'room_number.max' => 'Room number cannot exceed 20 characters.',
            'floor.min' => 'Floor must be 0 or greater.',
        ];
    }
}
