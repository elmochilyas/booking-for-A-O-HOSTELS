<?php

namespace App\Http\Requests\Api\Booking;

use App\Enums\BookingSource;
use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateBookingRequest extends FormRequest
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
            'check_in_date' => ['required', 'date', 'after_or_equal:today'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'guest_count' => ['required', 'integer', 'min:1', 'max:10'],
            'special_requests' => ['sometimes', 'string', 'max:500'],
            'payment_method' => ['sometimes', Rule::enum(PaymentMethod::class)],
            'source' => ['sometimes', Rule::enum(BookingSource::class)],
            'extras' => ['sometimes', 'array'],
            'extras.*' => ['uuid', 'exists:extras,id'],
            'guest_details' => ['sometimes', 'array'],
            'guest_details.first_name' => ['required_with:guest_details', 'string', 'max:100'],
            'guest_details.last_name' => ['required_with:guest_details', 'string', 'max:100'],
            'guest_details.email' => ['required_with:guest_details', 'email', 'max:255'],
            'guest_details.phone' => ['sometimes', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Property is required.',
            'property_id.exists' => 'Selected property does not exist.',
            'room_type_id.required' => 'Room type is required.',
            'room_type_id.exists' => 'Selected room type does not exist.',
            'check_in_date.required' => 'Check-in date is required.',
            'check_in_date.after_or_equal' => 'Check-in date must be today or later.',
            'check_out_date.required' => 'Check-out date is required.',
            'check_out_date.after' => 'Check-out date must be after check-in date.',
            'guest_count.required' => 'Number of guests is required.',
            'guest_count.min' => 'At least 1 guest is required.',
            'guest_count.max' => 'Maximum 10 guests allowed.',
            'payment_method.required' => 'Payment method is required.',
        ];
    }
}
