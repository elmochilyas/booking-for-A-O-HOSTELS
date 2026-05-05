<?php

namespace App\Repositories;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

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

    public function checkAvailability(string $roomTypeId, string $checkIn, string $checkOut): bool
    {
        // Check if room type has available rooms for the given dates
        $bookedRooms = Booking::where('room_type_id', $roomTypeId)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->count();

        $totalRooms = Room::where('room_type_id', $roomTypeId)
            ->where('status', 'available')
            ->count();

        return $bookedRooms < $totalRooms;
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
