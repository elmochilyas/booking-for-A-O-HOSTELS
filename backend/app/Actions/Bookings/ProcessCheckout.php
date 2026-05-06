<?php

namespace App\Actions\Bookings;

use App\DTO\CheckoutContext;
use App\Events\BookingCreated;
use App\Models\Booking;
use App\Pipelines\Checkout\ApplyCoupon;
use App\Pipelines\Checkout\CalculateTax;
use App\Pipelines\Checkout\ChargePayment;
use App\Pipelines\Checkout\ReserveInventory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

readonly class ProcessCheckout
{
    public function handle(CheckoutContext $ctx): array
    {
        $result = DB::transaction(function () use ($ctx) {
            $processed = app(Pipeline::class)
                ->send($ctx)
                ->through([
                    ApplyCoupon::class,
                    CalculateTax::class,
                    ReserveInventory::class,
                    ChargePayment::class,
                ])
                ->thenReturn();

            return [
                'success' => true,
                'booking_id' => $processed->bookingId,
                'total' => $processed->subtotal - $processed->discount + $processed->tax,
                'discount' => $processed->discount,
                'tax' => $processed->tax,
                'payment_result' => $processed->paymentResult,
            ];
        });

        // Dispatch event AFTER commit
        if ($result['success']) {
            $booking = Booking::find($result['booking_id']);
            if ($booking) {
                BookingCreated::dispatch($booking);
            }
        }

        return $result;
    }
}
