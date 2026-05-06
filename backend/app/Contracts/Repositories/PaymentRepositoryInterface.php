<?php

namespace App\Contracts\Repositories;

use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PaymentRepositoryInterface
{
    public function find(string $id): ?Payment;

    public function findOrFail(string $id): Payment;

    public function create(array $data): Payment;

    public function update(Payment $payment, array $data): Payment;

    public function delete(Payment $payment): bool;

    public function getByBooking(string $bookingId): LengthAwarePaginator;

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function getTotalByPeriod(string $startDate, string $endDate, ?string $propertyId = null): float;

    public function refund(Payment $payment, array $data): Payment;

    public function findByStripeId(string $stripePaymentId): ?Payment;
}
