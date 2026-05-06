<?php>

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonApiResource;

class GuestJsonApiResource extends JsonApiResource
{
    public function toAttributes($request): array
    {
        return [
            'email' => $this->email,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'phone' => $this->phone,
            'country' => $this->country,
            'dateOfBirth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender,
            'isEmailVerified' => ! is_null($this->email_verified_at),
            'loyaltyMember' => $this->is_loyalty_member,
            'loyaltyPoints' => $this->loyalty_points,
        ];
    }

    public function toRelationships($request): array
    {
        return [
            'bookings' => BookingJsonApiResource::collection($this->whenLoaded('bookings')),
        ];
    }

    public function toLinks($request): array
    {
        return [
            'self' => route('api.guests.show', $this->id),
        ];
    }
}
