<?php

declare(strict_types=1);

namespace App\Queries;

use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Models\Payment;

readonly class GetRevenueQuery
{
    public function __construct(
        private PaymentRepositoryInterface $paymentRepository,
    ) {}

    public function handle(?string $propertyId, string $startDate, string $endDate): array
    {
        $query = Payment::where('status', 'completed');

        if ($propertyId) {
            $query->whereHas('booking', fn ($q) => $q->where('property_id', $propertyId));
        }

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        $dailyRevenue = Payment::selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->get();

        return [
            'total_revenue' => $query->sum('amount'),
            'daily_revenue' => $dailyRevenue,
            'transactions_count' => $query->count(),
            'average_transaction' => $query->avg('amount'),
        ];
    }
}
