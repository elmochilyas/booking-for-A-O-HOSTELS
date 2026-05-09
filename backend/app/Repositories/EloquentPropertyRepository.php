<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\Models\Booking;
use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class EloquentPropertyRepository implements PropertyRepositoryInterface
{
    public function find(string $id): ?Property
    {
        $key = "property:{$id}:detail";

        return Cache::remember(
            $key,
            3600,
            fn () => Property::with(['rooms.roomType', 'amenities'])->find($id)
        );
    }

    public function findOrFail(string $id): Property
    {
        $key = "property:{$id}:detail";

        return Cache::remember(
            $key,
            3600,
            fn () => Property::with(['rooms.roomType', 'amenities'])->findOrFail($id)
        );
    }

    public function findFirst(): ?Property
    {
        return Cache::remember(
            'property:first',
            3600,
            fn () => Property::with(['rooms.roomType', 'amenities'])->first()
        );
    }

    public function create(array $data): Property
    {
        $property = Property::create($data);
        Cache::flush();

        return $property->load(['rooms', 'amenities']);
    }

    public function update(Property $property, array $data): Property
    {
        $property->update($data);
        Cache::forget("property:{$property->id}:detail");

        return $property->fresh(['rooms', 'amenities']);
    }

    public function delete(Property $property): bool
    {
        $result = $property->delete();
        Cache::forget("property:{$property->id}:detail");

        return $result;
    }

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Property::with(['rooms', 'amenities']);
        $query = $this->applyFilters($query, $filters);

        return $query->latest()->paginate($perPage);
    }

    public function findByCity(string $city): LengthAwarePaginator
    {
        return Cache::remember(
            "property:city:{$city}",
            3600,
            fn () => Property::with(['rooms.roomType', 'amenities'])
                ->where('city', $city)
                ->where('status', 'active')
                ->latest()
                ->paginate(15)
        );
    }

    public function findByStatus(string $status): LengthAwarePaginator
    {
        return Cache::remember(
            "property:status:{$status}",
            3600,
            fn () => Property::with(['rooms.roomType', 'amenities'])
                ->where('status', $status)
                ->latest()
                ->paginate(15)
        );
    }

    public function search(string $query, array $filters = []): LengthAwarePaginator
    {
        $cacheKey = 'property:search:'.md5($query.serialize($filters));

        return Cache::remember(
            $cacheKey,
            1800,
            function () use ($query, $filters) {
                $searchQuery = Property::with(['rooms.roomType', 'amenities'])
                    ->where(function ($q) use ($query) {
                        $q->where('name', 'like', "%{$query}%")
                            ->orWhere('description', 'like', "%{$query}%")
                            ->orWhere('city', 'like', "%{$query}%")
                            ->orWhere('address', 'like', "%{$query}%");
                    });

                $searchQuery = $this->applyFilters($searchQuery, $filters);

                return $searchQuery->latest()->paginate($filters['per_page'] ?? 15);
            }
        );
    }

    public function getWithAvailability(string $checkIn, string $checkOut): array
    {
        return Cache::remember(
            "property:availability:{$checkIn}:{$checkOut}",
            600,
            function () use ($checkIn, $checkOut) {
                return Property::with(['rooms.roomType'])
                    ->where('status', 'active')
                    ->get()
                    ->map(function ($property) use ($checkIn, $checkOut) {
                        $availableRooms = $property->rooms->filter(function ($room) use ($checkIn, $checkOut) {
                            return $this->isRoomAvailable($room->id, $checkIn, $checkOut);
                        });

                        $property->available_rooms = $availableRooms->count();

                        return $property;
                    })
                    ->toArray();
            }
        );
    }

    public function getDestinations(): array
    {
        return Cache::remember('property:destinations', 3600, fn () => Property::query()
            ->select(['id', 'name', 'location', 'latitude', 'longitude', 'rating'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get()
            ->map(fn (Property $p) => [
                'id'        => $p->id,
                'name'      => $p->name,
                'location'  => $p->location,
                'latitude'  => (float) $p->latitude,
                'longitude' => (float) $p->longitude,
                'rating'    => (float) $p->rating,
            ])
            ->toArray()
        );
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['city'] ?? null, fn ($q, $v) => $q->where('city', $v))
            ->when($filters['country'] ?? null, fn ($q, $v) => $q->where('country', $v))
            ->when($filters['min_price'] ?? null, fn ($q, $v) => $q->whereHas('rooms', fn ($roomQuery) => $roomQuery->where('price', '>=', $v)))
            ->when($filters['max_price'] ?? null, fn ($q, $v) => $q->whereHas('rooms', fn ($roomQuery) => $roomQuery->where('price', '<=', $v)));
    }

    private function isRoomAvailable(string $roomId, string $checkIn, string $checkOut): bool
    {
        return ! Booking::where('room_id', $roomId)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->exists();
    }
}
