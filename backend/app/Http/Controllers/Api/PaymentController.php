<?php

namespace App\Http\Controllers\Api;

use App\Actions\Payments\ConfirmPayment;
use App\Actions\Payments\CreatePaymentIntent;
use App\Actions\Payments\RefundPayment as RefundPaymentAction;
use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\DTO\ConfirmPaymentDTO;
use App\Exceptions\InvalidBookingStatusException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Payment\ConfirmPaymentRequest;
use App\Http\Requests\Api\Payment\CreatePaymentIntentRequest;
use App\Http\Requests\Api\Payment\RefundPaymentRequest;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
        private BookingRepositoryInterface $bookings,
    ) {}

    public function createIntent(CreatePaymentIntentRequest $request, CreatePaymentIntent $action): JsonResponse
    {
        try {
            $booking = $this->bookings->findOrFail($request->validated()['booking_id']);
            $depositPercentage = $request->validated()['deposit_percentage'] ?? 100;
            $amount = $request->validated()['amount'] ?? ($booking->total_price * $depositPercentage / 100);

            $result = $action->handle(
                $booking->id,
                (float) $amount,
                $request->validated()['payment_method'],
                (int) $depositPercentage
            );

            return response()->json($result);
        } catch (InvalidBookingStatusException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create payment intent: '.$e->getMessage()], 500);
        }
    }

    public function confirmPayment(ConfirmPaymentRequest $request, ConfirmPayment $action): JsonResponse
    {
        try {
            $dto = ConfirmPaymentDTO::fromRequest($request);
            $result = $action->handle($dto);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Payment verification failed'], 500);
        }
    }

    public function refund(string $bookingId, RefundPaymentRequest $request, RefundPaymentAction $action): JsonResponse
    {
        try {
            $result = $action->handle(
                $bookingId,
                $request->validated()['amount'] ?? null,
                $request->validated()['reason'] ?? null
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Refund failed: '.$e->getMessage()], 500);
        }
    }

    public function bookingPayments(string $bookingId): JsonResponse
    {
        $booking = $this->bookings->findOrFail($bookingId);

        return response()->json([
            'payments' => $booking->payments,
            'total_paid' => $booking->payments()->where('status', 'success')->sum('amount'),
        ]);
    }
}
