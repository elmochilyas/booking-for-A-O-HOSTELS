<?php

namespace App\Http\Requests\Api\Property;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\PropertyStatus;

class CreatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'              => ['required', 'string', 'max:255'],
            'slug'              => ['sometimes', 'string', 'max:255', 'unique:properties,slug'],
            'description'       => ['sometimes', 'string'],
            'address'           => ['required', 'string', 'max:500'],
            'city'              => ['required', 'string', 'max:100'],
            'state'             => ['sometimes', 'string', 'max:100'],
            'country'           => ['required', 'string', 'max:100'],
            'postal_code'       => ['sometimes', 'string', 'max:20'],
            'latitude'          => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude'         => ['sometimes', 'numeric', 'between:-180,180'],
            'phone'             => ['sometimes', 'string', 'max:20'],
            'email'             => ['sometimes', 'email', 'max:255'],
            'status'            => ['sometimes', Rule::enum(PropertyStatus::class)],
            'amenities'         => ['sometimes', 'array'],
            'amenities.*'       => ['uuid', 'exists:amenities,id'],
            'images'            => ['sometimes', 'array', 'max:10'],
            'images.*'          => ['image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Property name is required.',
            'address.required'  => 'Address is required.',
            'city.required'    => 'City is required.',
            'country.required'  => 'Country is required.',
            'slug.unique'      => 'This slug is already in use.',
        ];
    }
}
