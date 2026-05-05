<?php

namespace App\Repositories;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Models\Guest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EloquentGuestRepository implements GuestRepositoryInterface
{
    public function find(string $id): ?Guest
    {
        return Guest::with(['bookings', 'loyaltyPoints'])->find($id);
    }

    public function findOrFail(string $id): Guest
    {
        return Guest::with(['bookings', 'loyaltyPoints'])->findOrFail($id);
    }

    public function create(array $data): Guest
    {
        $guest = Guest::create($data);
        return $guest->load(['bookings']);
    }

    public function update(Guest $guest, array $data): Guest
    {
        $guest->update($data);
        return $guest->fresh(['bookings', 'loyaltyPoints']);
    }

    public function delete(Guest $guest): bool
    {
        return $guest->delete();
    }

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Guest::with(['bookings']);

        $query = $this->applyFilters($query, $filters);

        return $query->latest()->paginate($perPage);
    }

    public function findByEmail(string $email): ?Guest
    {
        return Guest::where('email', $email)->first();
    }

    public function updateLoyaltyPoints(string $guestId, int $points): void
    {
        $guest = $this->findOrFail($guestId);
        $guest->increment('loyalty_points', $points);
    }

    public function getLoyaltyTier(string $guestId): string
    {
        $guest = $this->findOrFail($guestId);
        return \App\Enums\LoyaltyTier::fromPoints($guest->loyalty_points)->value;
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($filters['email'] ?? null, fn($q, $v) => $q->where('email', $v))
            ->when($filters['from'] ?? null, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['to'] ?? null, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($filters['search'] ?? null, fn($q, $v) => $q->where(function ($query) use ($v) {
                $query->where('first_name', 'like', "%{$v}%")
                    ->orWhere('last_name', 'like', "%{$v}%")
                    ->orWhere('email', 'like', "%{$v}%");
            }));
    }
}
