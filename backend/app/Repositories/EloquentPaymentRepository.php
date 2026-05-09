<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EloquentPaymentRepository implements PaymentRepositoryInterface
{
    public function find(string $id): ?Payment
    {
        return Payment::with(['booking', 'booking.guest'])->find($id);
    }

    public function findOrFail(string $id): Payment
    {
        return Payment::with(['booking', 'booking.guest'])->findOrFail($id);
    }

    public function findByStripeId(string $stripePaymentId): ?Payment
    {
        return Payment::with(['booking', 'booking.guest'])->where('stripe_payment_id', $stripePaymentId)->first();
    }

    public function create(array $data): Payment
    {
        $payment = Payment::create($data);

        return $payment->load(['booking']);
    }

    public function update(Payment $payment, array $data): Payment
    {
        $payment->update($data);

        return $payment->fresh(['booking', 'booking.guest']);
    }

    public function delete(Payment $payment): bool
    {
        return $payment->delete();
    }

    public function getByBooking(string $bookingId): LengthAwarePaginator
    {
        return Payment::with(['booking'])
            ->where('booking_id', $bookingId)
            ->latest()
            ->paginate(15);
    }

    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Payment::with(['booking.guest', 'booking.property']);

        $query = $this->applyFilters($query, $filters);

        return $query->latest()->paginate($perPage);
    }

    public function getTotalByPeriod(string $startDate, string $endDate, ?string $propertyId = null): float
    {
        $query = Payment::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed');

        if ($propertyId) {
            $query->whereHas('booking', fn ($q) => $q->where('property_id', $propertyId));
        }

        return $query->sum('amount');
    }

    public function refund(Payment $payment, array $data): Payment
    {
        $payment->update([
            'status' => 'refunded',
            'refund_reason' => $data['reason'] ?? null,
            'refunded_at' => now(),
        ]);

        return $payment->fresh();
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['booking_id'] ?? null, fn ($q, $v) => $q->where('booking_id', $v))
            ->when($filters['payment_method'] ?? null, fn ($q, $v) => $q->where('payment_method', $v))
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '<=', $v));
    }
}
