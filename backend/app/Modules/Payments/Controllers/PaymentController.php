<?php

namespace App\Modules\Payments\Controllers;

use App\Modules\Payments\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController
{
    private PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function createPaymentIntent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|uuid|exists:bookings,id',
            'is_deposit' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->paymentService->createPaymentIntent(
            $request->booking_id,
            $request->boolean('is_deposit', true)
        );

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function confirmPayment(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'payment_id' => 'required|uuid',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->paymentService->confirmPayment($request->payment_id);

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function getPaymentDetails(string $bookingId): JsonResponse
    {
        $payments = $this->paymentService->getPaymentByBooking($bookingId);
        $totalPaid = $this->paymentService->calculateTotalPaid($bookingId);

        return response()->json([
            'payments' => $payments,
            'total_paid' => $totalPaid,
        ]);
    }

    public function processRefund(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'payment_id' => 'required|uuid',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->paymentService->processRefund($request->payment_id);

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function getPaymentBreakdown(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'total_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $deposit = $this->paymentService->getDepositAmount($request->total_price);
        $balance = $this->paymentService->getBalanceAmount($request->total_price);

        return response()->json([
            'total_price' => $request->total_price,
            'deposit' => $deposit,
            'balance_at_property' => $balance,
            'deposit_percentage' => 20,
            'message' => 'Pay 20% now, remaining balance due at check-in',
        ]);
    }
}
