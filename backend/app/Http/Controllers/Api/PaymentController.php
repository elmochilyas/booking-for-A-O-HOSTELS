<?php

namespace App\Http\Controllers\Api;

use App\Actions\Payments\ConfirmPayment;
use App\Actions\Payments\CreatePaymentIntent;
use App\Actions\Payments\GetBookingPayments;
use App\Actions\Payments\RefundPayment as RefundPaymentAction;
use App\DTO\ConfirmPaymentDTO;
use App\Exceptions\InvalidBookingStatusException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Payment\ConfirmPaymentRequest;
use App\Http\Requests\Api\Payment\CreatePaymentIntentRequest;
use App\Http\Requests\Api\Payment\RefundPaymentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('auth.jwt')]
class PaymentController extends Controller
{
    public function __construct(
        private CreatePaymentIntent $createPaymentIntent,
        private ConfirmPayment $confirmPayment,
        private RefundPaymentAction $refundPayment,
        private GetBookingPayments $getBookingPayments,
    ) {}

    public function createIntent(CreatePaymentIntentRequest $request): JsonResponse
    {
        try {
            $bookingId = $request->validated()['booking_id'];
            $depositPercentage = $request->validated()['deposit_percentage'] ?? 100;
            $amount = $request->validated()['amount'] ?? null;

            $result = $this->createPaymentIntent->handle(
                $bookingId,
                (float) ($amount ?? 0),
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

    public function confirmPayment(ConfirmPaymentRequest $request): JsonResponse
    {
        try {
            $dto = ConfirmPaymentDTO::fromRequest($request);
            $result = $this->confirmPayment->handle($dto);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Payment verification failed'], 500);
        }
    }

    public function refund(string $bookingId, RefundPaymentRequest $request): JsonResponse
    {
        try {
            $result = $this->refundPayment->handle(
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
        $result = $this->getBookingPayments->handle($bookingId);

        return response()->json($result);
    }
}
