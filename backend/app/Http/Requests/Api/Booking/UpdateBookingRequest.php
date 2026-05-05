<?php

namespace App\Http\Requests\Api\Booking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\BookingStatus;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'check_in_date'   => ['sometimes', 'date', 'after_or_equal:today'],
            'check_out_date'  => ['sometimes', 'date', 'after:check_in_date'],
            'guest_count'     => ['sometimes', 'integer', 'min:1', 'max:10'],
            'special_requests' => ['sometimes', 'string', 'max:500'],
            'status'          => ['sometimes', Rule::enum(BookingStatus::class)],
        ];
    }
}
