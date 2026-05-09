<?php

declare(strict_types=1);

namespace App\Modules\Bookings\Services;

use App\Models\Booking;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Support\Facades\Cache;

class AvailabilityService
{
    public function checkAvailability(string $propertyId, string $checkIn, string $checkOut, int $guests = 1): array
    {
        $cacheKey = "availability:{$propertyId}:{$checkIn}:{$checkOut}:{$guests}";

        return Cache::remember($cacheKey, 300, function () use ($propertyId, $checkIn, $checkOut, $guests) {
            $roomTypes = RoomType::where('property_id', $propertyId)
                ->where('capacity', '>=', $guests)
                ->with('amenities')
                ->get();

            $availableRooms = [];

            foreach ($roomTypes as $roomType) {
                $bookedCount = $this->getBookedRoomsCount($roomType->id, $checkIn, $checkOut);
                $totalRooms = Room::where('room_type_id', $roomType->id)->count();
                $available = $totalRooms - $bookedCount;

                if ($available > 0) {
                    $availableRooms[] = [
                        'id' => $roomType->id,
                        'name' => $roomType->name,
                        'capacity' => $roomType->capacity,
                        'base_price' => $roomType->base_price,
                        'description' => $roomType->description,
                        'amenities' => $roomType->amenities->pluck('name'),
                        'available' => $available,
                        'total_rooms' => $totalRooms,
                        'price_per_night' => $this->calculatePrice($roomType, $checkIn, $checkOut),
                    ];
                }
            }

            return $availableRooms;
        });
    }

    private function getBookedRoomsCount(string $roomTypeId, string $checkIn, string $checkOut): int
    {
        return Booking::where('room_type_id', $roomTypeId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->count();
    }

    public function getBookedRoomIds(string $roomTypeId, string $checkIn, string $checkOut): array
    {
        return Booking::where('room_type_id', $roomTypeId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->pluck('room_id')
            ->toArray();
    }

    private function calculatePrice(RoomType $roomType, string $checkIn, string $checkOut): float
    {
        $nights = (new \DateTime($checkIn))->diff(new \DateTime($checkOut))->days;
        $basePrice = $roomType->base_price * $nights;

        return $basePrice;
    }

    public function clearCache(string $propertyId, ?string $checkIn = null, ?string $checkOut = null): void
    {
        if ($checkIn && $checkOut) {
            Cache::forget("availability:{$propertyId}:{$checkIn}:{$checkOut}:1");
        } else {
            Cache::forget("property:{$propertyId}:roomtypes");
        }
    }
}
