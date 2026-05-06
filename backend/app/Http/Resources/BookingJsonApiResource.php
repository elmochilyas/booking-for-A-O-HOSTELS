<?php>

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonApiResource;

class BookingJsonApiResource extends JsonApiResource
{
    public function toAttributes($request): array
    {
        return [
            'propertyId' => $this->property_id,
            'roomTypeId' => $this->room_type_id,
            'guestId' => $this->guest_id,
            'checkInDate' => $this->check_in_date?->toIso8601String(),
            'checkOutDate' => $this->check_out_date?->toIso8601String(),
            'guestCount' => $this->guest_count,
            'totalPrice' => $this->total_price,
            'status' => $this->status?->value,
        ];
    }

    public function toRelationships($request): array
    {
        return [
            'guest' => GuestJsonApiResource::make($this->whenLoaded('guest')),
            'property' => PropertyJsonApiResource::make($this->whenLoaded('property')),
        ];
    }

    public function toLinks($request): array
    {
        return [
            'self' => route('api.bookings.show', $this->id),
        ];
    }
}
