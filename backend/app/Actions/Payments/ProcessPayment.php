<?php

namespace App\Actions\Payments;

use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Repositories\BookingRepositoryInterface;
use App\DTO\CreatePaymentDTO;
use App\Enums\PaymentStatus;
use App\Events\PaymentProcessed;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

readonly class ProcessPayment
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
        private BookingRepositoryInterface $bookings,
    ) {}

    public function handle(CreatePaymentDTO $dto): Payment
    {
        $payment = DB::transaction(function () use ($dto) {
            $payment = $this->payments->create([
                'id'            => (string) \Illuminate\Support\Str::uuid(),
                'booking_id'    => $dto->bookingId,
                'amount'         => $dto->amount,
                'payment_method' => $dto->paymentMethod->value,
                'status'         => PaymentStatus::PENDING,
                'payment_details' => $dto->paymentDetails,
            ]);

            // Update booking status
            $booking = $this->bookings->findOrFail($dto->bookingId);
            $this->bookings->update($booking, [
                'status' => \App\Enums\BookingStatus::CONFIRMED,
            ]);

            return $payment->load('booking');
        });

        PaymentProcessed::dispatch($payment);

        return $payment;
    }
}
