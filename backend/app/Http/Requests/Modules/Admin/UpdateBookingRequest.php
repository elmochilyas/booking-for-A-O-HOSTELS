<?php

namespace App\Http\Requests\Modules\Admin;

use App\Enums\BookingStatus;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'check_in_date' => ['sometimes', 'date'],
            'check_out_date' => ['sometimes', 'date', 'after:check_in_date'],
            'room_type_id' => ['sometimes', 'uuid', 'exists:room_types,id'],
            'guest_count' => ['sometimes', 'integer', 'min:1'],
            'total_price' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::enum(BookingStatus::class)],
            'notes' => ['nullable', 'string'],
        ];
    }
}
