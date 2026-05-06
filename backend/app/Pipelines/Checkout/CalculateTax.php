<?php

namespace App\Pipelines\Checkout;

use App\DTO\CheckoutContext;
use App\Services\TaxCalculator;
use Closure;

class CalculateTax
{
    public function __construct(
        private TaxCalculator $taxCalculator,
    ) {}

    public function handle(CheckoutContext $ctx, Closure $next): CheckoutContext
    {
        $ctx->tax = $this->taxCalculator->forRegion($ctx->shippingAddress->country)
            ->calculate($ctx->subtotal - $ctx->discount);

        return $next($ctx);
    }
}
