<?php

declare(strict_types=1);

namespace App\Modules\Payments\Controllers;

use App\Actions\Payments\ConfirmPayment;
use App\Actions\Payments\CreatePaymentIntent;
use App\Actions\Payments\GetBookingPayments;
use App\Actions\Payments\GetPaymentBreakdown;
use App\Actions\Payments\ProcessRefund;
use App\Http\Requests\Modules\Payments\ConfirmPaymentRequest;
use App\Http\Requests\Modules\Payments\CreatePaymentIntentRequest;
use App\Http\Requests\Modules\Payments\GetPaymentBreakdownRequest;
use App\Http\Requests\Modules\Payments\ProcessRefundRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class PaymentController extends Controller
{
    public function createPaymentIntent(CreatePaymentIntentRequest $request, CreatePaymentIntent $action): JsonResponse
    {
        $result = $action->handle(
            $request->validated('booking_id'),
            $request->boolean('is_deposit', true)
        );

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function confirmPayment(ConfirmPaymentRequest $request, ConfirmPayment $action): JsonResponse
    {
        $result = $action->handle($request->validated('payment_id'));

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function getPaymentDetails(string $bookingId, GetBookingPayments $action): JsonResponse
    {
        $payments = $action->handle($bookingId);
        $totalPaid = $action->calculateTotalPaid($bookingId);

        return response()->json([
            'payments' => $payments,
            'total_paid' => $totalPaid,
        ]);
    }

    public function processRefund(ProcessRefundRequest $request, ProcessRefund $action): JsonResponse
    {
        $result = $action->handle($request->validated('payment_id'));

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function getPaymentBreakdown(GetPaymentBreakdownRequest $request, GetPaymentBreakdown $action): JsonResponse
    {
        $deposit = $action->getDepositAmount($request->validated('total_price'));
        $balance = $action->getBalanceAmount($request->validated('total_price'));

        return response()->json([
            'total_price' => $request->validated('total_price'),
            'deposit' => $deposit,
            'balance_at_property' => $balance,
            'deposit_percentage' => 20,
            'message' => 'Pay 20% now, remaining balance due at check-in',
        ]);
    }
}
