<?php

namespace App\Contracts\Repositories;

use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BookingRepositoryInterface
{
    public function find(string $id): ?Booking;

    public function findOrFail(string $id): Booking;

    public function create(array $data): Booking;

    public function update(Booking $booking, array $data): Booking;

    public function delete(Booking $booking): bool;

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function findByGuest(string $guestId, array $filters = []): LengthAwarePaginator;

    public function checkAvailability(string $roomTypeId, string $checkIn, string $checkOut, ?string $excludeBookingId = null): bool;

    public function findAvailableRoom(string $propertyId, string $roomTypeId, string $checkIn, string $checkOut): ?\App\Models\Room;

    public function calculateTotalPrice(string $propertyId, string $roomTypeId, string $checkIn, string $checkOut, array $extras = []): float;

    public function getAvailableRooms(string $propertyId, string $checkIn, string $checkOut): array;

    public function getByProperty(string $propertyId, array $filters = []): LengthAwarePaginator;

    public function getRevenueByPeriod(string $startDate, string $endDate, ?string $propertyId = null): float;
}
