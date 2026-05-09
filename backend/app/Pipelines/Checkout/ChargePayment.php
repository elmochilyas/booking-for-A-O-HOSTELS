<?php

declare(strict_types=1);

namespace App\Pipelines\Checkout;

use App\Contracts\Services\PaymentGatewayInterface;
use App\DTO\CheckoutContext;
use Closure;

class ChargePayment
{
    public function __construct(
        private PaymentGatewayInterface $paymentGateway,
    ) {}

    public function handle(CheckoutContext $ctx, Closure $next): CheckoutContext
    {
        $total = $ctx->subtotal - $ctx->discount + $ctx->tax;

        $ctx->paymentResult = $this->paymentGateway->charge([
            'amount' => $total,
            'payment_method' => $ctx->paymentMethod,
            'metadata' => ['booking_id' => $ctx->bookingId],
        ]);

        return $next($ctx);
    }
}
