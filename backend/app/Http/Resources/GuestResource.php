<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'phone' => $this->phone,
            'country' => $this->country,
            'dateOfBirth' => $this->date_of_birth?->toDateString(),
            'address' => $this->address,
            'gender' => $this->gender,
            'isEmailVerified' => ! is_null($this->email_verified_at),
            'aoClubMember' => $this->is_loyalty_member,
            'loyaltyPoints' => $this->loyalty_points,
            'memberSince' => $this->created_at?->toDateString(),
            'notifications' => [
                'notificationEmail' => $this->notification_email ?? true,
                'notificationSms' => $this->notification_sms ?? false,
            ],
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
