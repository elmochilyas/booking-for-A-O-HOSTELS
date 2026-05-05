<?php

namespace App\Contracts\Repositories;

use App\Models\Guest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface GuestRepositoryInterface
{
    public function find(string $id): ?Guest;
    public function findOrFail(string $id): Guest;
    public function create(array $data): Guest;
    public function update(Guest $guest, array $data): Guest;
    public function delete(Guest $guest): bool;
    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator;
    public function findByEmail(string $email): ?Guest;
    public function updateLoyaltyPoints(string $guestId, int $points): void;
    public function getLoyaltyTier(string $guestId): string;
}
