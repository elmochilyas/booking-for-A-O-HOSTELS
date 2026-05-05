<?php

namespace App\Repositories;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Models\Booking;
use App\Models\Extra;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class EloquentBookingRepository implements BookingRepositoryInterface
{
    public function find(string $id): ?Booking
    {
        return Booking::with(['guest', 'room', 'property', 'payments'])->find($id);
    }

    public function findOrFail(string $id): Booking
    {
        return Booking::with(['guest', 'room', 'property', 'payments'])->findOrFail($id);
    }

    public function create(array $data): Booking
    {
        $booking = Booking::create($data);

        return $booking->load(['guest', 'room', 'property']);
    }

    public function update(Booking $booking, array $data): Booking
    {
        $booking->update($data);

        return $booking->fresh(['guest', 'room', 'property', 'payments']);
    }

    public function delete(Booking $booking): bool
    {
        return $booking->delete();
    }

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Booking::with(['guest', 'room.roomType', 'property']);

        $query = $this->applyFilters($query, $filters);

        return $query->latest()->paginate($perPage);
    }

    public function findByGuest(string $guestId, array $filters = []): LengthAwarePaginator
    {
        $query = Booking::with(['room.roomType', 'property'])
            ->where('guest_id', $guestId);

        $query = $this->applyFilters($query, $filters);

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function checkAvailability(string $roomTypeId, string $checkIn, string $checkOut, ?string $excludeBookingId = null): bool
    {
        $query = Booking::where('room_type_id', $roomTypeId)
            ->whereIn('status', ['confirmed', 'pending', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            });

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        return $query->exists(); // Returns true if there ARE conflicting bookings (not available)
    }

    public function findAvailableRoom(string $propertyId, string $roomTypeId, string $checkIn, string $checkOut): ?Room
    {
        $bookedRoomIds = Booking::where('property_id', $propertyId)
            ->where('room_type_id', $roomTypeId)
            ->whereIn('status', ['confirmed', 'pending', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->whereNotNull('room_id')
            ->pluck('room_id')
            ->toArray();

        return Room::where('property_id', $propertyId)
            ->where('room_type_id', $roomTypeId)
            ->where('status', 'available')
            ->whereNotIn('id', $bookedRoomIds)
            ->first();
    }

    public function calculateTotalPrice(string $propertyId, string $roomTypeId, string $checkIn, string $checkOut, array $extras = []): float
    {
        $roomType = RoomType::find($roomTypeId);
        $basePrice = $this->calculatePrice($roomType->base_price ?? 0, $checkIn, $checkOut);

        $extrasPrice = 0;
        foreach ($extras as $extra) {
            $extraModel = Extra::find($extra['id']);
            if ($extraModel) {
                $extrasPrice += $extraModel->price * ($extra['quantity'] ?? 1);
            }
        }

        return $basePrice + $extrasPrice;
    }

    private function calculatePrice(float $basePrice, string $checkIn, string $checkOut): float
    {
        $nights = max(1, (strtotime($checkOut) - strtotime($checkIn)) / (60 * 60 * 24));

        return $basePrice * $nights;
    }

    public function getAvailableRooms(string $propertyId, string $checkIn, string $checkOut): array
    {
        $roomTypes = RoomType::where('property_id', $propertyId)
            ->with('rooms')
            ->get()
            ->filter(function ($roomType) use ($propertyId, $checkIn, $checkOut) {
                return ! $this->checkAvailability($propertyId, $roomType->id, $checkIn, $checkOut);
            })
            ->values();

        return $roomTypes->toArray();
    }

    public function getByProperty(string $propertyId, array $filters = []): LengthAwarePaginator
    {
        $query = Booking::with(['guest', 'room.roomType'])
            ->where('property_id', $propertyId);

        $query = $this->applyFilters($query, $filters);

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function getRevenueByPeriod(string $startDate, string $endDate, ?string $propertyId = null): float
    {
        $query = Booking::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed');

        if ($propertyId) {
            $query->where('property_id', $propertyId);
        }

        return $query->sum('total_amount');
    }

    public function countByPropertyAndStatus(string $propertyId, string $status, ?string $dateColumn = null, ?string $date = null): int
    {
        $query = Booking::where('property_id', $propertyId)->where('status', $status);

        if ($dateColumn && $date) {
            $query->where($dateColumn, $date);
        }

        return $query->count();
    }

    public function sumRevenueByPropertyAndDate(string $propertyId, array $statuses, string $date): float
    {
        return Booking::where('property_id', $propertyId)
            ->whereIn('status', $statuses)
            ->where('check_in_date', $date)
            ->sum('total_price');
    }

    public function getByPropertyAndStatus(string $propertyId, string $status, string $dateColumn, string $date, array $with = []): Collection
    {
        $query = Booking::where('property_id', $propertyId)
            ->where('status', $status)
            ->where($dateColumn, $date);

        if (! empty($with)) {
            $query->with($with);
        }

        return $query->get();
    }

    public function countOccupiedRoomNights(string $propertyId, string $start, string $end): int
    {
        return Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('check_in_date', [$start, $end])
                    ->orWhereBetween('check_out_date', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('check_in_date', '<=', $start)
                            ->where('check_out_date', '>=', $end);
                    });
            })
            ->count();
    }

    public function countByPeriodAndStatus(string $propertyId, string $start, string $end, array $statuses): int
    {
        return Booking::where('property_id', $propertyId)
            ->whereIn('status', $statuses)
            ->whereBetween('check_in_date', [$start, $end])
            ->count();
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['property_id'] ?? null, fn ($q, $v) => $q->where('property_id', $v))
            ->when($filters['guest_id'] ?? null, fn ($q, $v) => $q->where('guest_id', $v))
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where('booking_number', 'like', "%{$v}%"));
    }
}
