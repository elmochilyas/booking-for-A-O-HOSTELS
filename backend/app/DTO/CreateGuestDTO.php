<?php

namespace App\DTO;

use App\Enums\BookingSource;

readonly class CreateGuestDTO
{
    public function __construct(
        public string           $firstName,
        public string           $lastName,
        public string           $email,
        public string           $password,
        public ?string          $phone = null,
        public ?string          $dateOfBirth = null,
        public ?BookingSource   $source = null,
    ) {}

    public static function fromRequest(\App\Http\Requests\Api\Auth\RegisterRequest $request): self
    {
        return new self(
            firstName: $request->validated('first_name'),
            lastName: $request->validated('last_name'),
            email: $request->validated('email'),
            password: $request->validated('password'),
            phone: $request->validated('phone'),
            dateOfBirth: $request->validated('date_of_birth'),
            source: $request->validated('source') ? BookingSource::from($request->validated('source')) : null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'first_name'     => $this->firstName,
            'last_name'      => $this->lastName,
            'email'          => $this->email,
            'password'       => $this->password,
            'phone'          => $this->phone,
            'date_of_birth' => $this->dateOfBirth,
            'source'         => $this->source?->value,
        ], fn($value) => !is_null($value));
    }
}
