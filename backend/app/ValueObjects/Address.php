<?php

declare(strict_types=1);

namespace App\ValueObjects;

readonly class Address
{
    public function __construct(
        public readonly string $address,
        public readonly string $city,
        public readonly ?string $state,
        public readonly string $country,
        public readonly ?string $postalCode = null,
        public readonly ?float $latitude = null,
        public readonly ?float $longitude = null,
    ) {}

    public function fullAddress(): string
    {
        $parts = [$this->address];

        if ($this->city) {
            $parts[] = $this->city;
        }

        if ($this->state) {
            $parts[] = $this->state;
        }

        if ($this->country) {
            $parts[] = $this->country;
        }

        if ($this->postalCode) {
            $parts[] = $this->postalCode;
        }

        return implode(', ', $parts);
    }

    public function hasCoordinates(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }

    public function toArray(): array
    {
        return [
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'postal_code' => $this->postalCode,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            address: $data['address'],
            city: $data['city'],
            state: $data['state'] ?? null,
            country: $data['country'],
            postalCode: $data['postal_code'] ?? null,
            latitude: $data['latitude'] ?? null,
            longitude: $data['longitude'] ?? null,
        );
    }
}
