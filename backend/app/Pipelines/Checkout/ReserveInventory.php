<?php

declare(strict_types=1);

namespace App\Pipelines\Checkout;

use App\Contracts\Repositories\InventoryRepositoryInterface;
use App\DTO\CheckoutContext;
use Closure;

class ReserveInventory
{
    public function __construct(
        private InventoryRepositoryInterface $inventoryRepository,
    ) {}

    public function handle(CheckoutContext $ctx, Closure $next): CheckoutContext
    {
        foreach ($ctx->items as $item) {
            $this->inventoryRepository->reserve(
                $item->productId,
                $item->quantity,
                $ctx->bookingId
            );
        }

        return $next($ctx);
    }
}
