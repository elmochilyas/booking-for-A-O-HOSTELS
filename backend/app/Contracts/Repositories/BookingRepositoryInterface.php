<?php

declare(strict_types=1);

namespace App\Contracts\Repositories;

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

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

    public function findAvailableRoom(string $propertyId, string $roomTypeId, string $checkIn, string $checkOut): ?Room;

    public function calculateTotalPrice(string $propertyId, string $roomTypeId, string $checkIn, string $checkOut, array $extras = []): float;

    public function getAvailableRooms(string $propertyId, string $checkIn, string $checkOut): array;

    public function getByProperty(string $propertyId, array $filters = []): LengthAwarePaginator;

    public function getRevenueByPeriod(string $startDate, string $endDate, ?string $propertyId = null): float;

    public function countByPropertyAndStatus(string $propertyId, string $status, ?string $dateColumn = null, ?string $date = null): int;

    public function sumRevenueByPropertyAndDate(string $propertyId, array $statuses, string $date): float;

    public function getByPropertyAndStatus(string $propertyId, string $status, string $dateColumn, string $date, array $with = []): Collection;

    public function countOccupiedRoomNights(string $propertyId, string $start, string $end): int;

    public function countByPeriodAndStatus(string $propertyId, string $start, string $end, array $statuses): int;

    public function getQuery(): Builder;
}
