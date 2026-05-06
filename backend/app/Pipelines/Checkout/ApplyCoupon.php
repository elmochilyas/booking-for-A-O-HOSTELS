<?php

namespace App\Pipelines\Checkout;

use App\DTO\CheckoutContext;
use App\Models\Coupon;
use Closure;

class ApplyCoupon
{
    public function handle(CheckoutContext $ctx, Closure $next): CheckoutContext
    {
        if ($ctx->couponCode) {
            $coupon = Coupon::active()->whereCode($ctx->couponCode)->firstOrFail();
            $ctx->discount = $coupon->calculateDiscount($ctx->subtotal);
        }

        return $next($ctx);
    }
}
