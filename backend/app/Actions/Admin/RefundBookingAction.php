<?php

namespace App\Actions\Admin;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

readonly class RefundBookingAction
{
    public function __construct(
        private BookingRepositoryInterface $bookingRepository,
        private PaymentRepositoryInterface $paymentRepository,
    ) {}

    public function handle(string $bookingId, ?float $amount = null, ?string $reason = null): Payment
    {
        $booking = $this->bookingRepository->findOrFail($bookingId);
        $payment = $this->paymentRepository->findSuccessByBooking($bookingId);

        $refundAmount = $amount ?? $payment->amount;

        return DB::transaction(function () use ($booking, $payment, $refundAmount) {
            $refund = $this->paymentRepository->create([
                'id' => Str::uuid()->toString(),
                'booking_id' => $booking->id,
                'amount' => -$refundAmount,
                'payment_method' => $payment->payment_method,
                'status' => 'refunded',
                'stripe_payment_id' => 'refund_'.Str::uuid()->toString(),
            ]);

            return $refund;
        });
    }
}
