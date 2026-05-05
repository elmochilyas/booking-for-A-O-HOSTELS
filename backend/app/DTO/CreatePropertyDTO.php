<?php

namespace App\DTO;

use App\Enums\PropertyStatus;

readonly class CreatePropertyDTO
{
    public function __construct(
        public string           $name,
        public string           $address,
        public string           $city,
        public string           $country,
        public ?string          $slug = null,
        public ?string          $description = null,
        public ?string          $state = null,
        public ?string          $postalCode = null,
        public ?float           $latitude = null,
        public ?float           $longitude = null,
        public ?string          $phone = null,
        public ?string          $email = null,
        public ?PropertyStatus  $status = null,
        public array            $amenities = [],
    ) {}

    public static function fromRequest(\App\Http\Requests\Api\Property\CreatePropertyRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            address: $request->validated('address'),
            city: $request->validated('city'),
            country: $request->validated('country'),
            slug: $request->validated('slug'),
            description: $request->validated('description'),
            state: $request->validated('state'),
            postalCode: $request->validated('postal_code'),
            latitude: $request->validated('latitude'),
            longitude: $request->validated('longitude'),
            phone: $request->validated('phone'),
            email: $request->validated('email'),
            status: $request->validated('status') ? PropertyStatus::from($request->validated('status')) : null,
            amenities: $request->validated('amenities', []),
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name'        => $this->name,
            'address'     => $this->address,
            'city'        => $this->city,
            'country'     => $this->country,
            'slug'        => $this->slug,
            'description' => $this->description,
            'state'       => $this->state,
            'postal_code' => $this->postalCode,
            'latitude'    => $this->latitude,
            'longitude'   => $this->longitude,
            'phone'       => $this->phone,
            'email'       => $this->email,
            'status'      => $this->status?->value,
        ], fn($value) => !is_null($value));
    }
}
