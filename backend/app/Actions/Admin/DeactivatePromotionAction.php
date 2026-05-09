<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Models\Promotion;

readonly class DeactivatePromotionAction
{
    public function handle(string $promotionId): Promotion
    {
        $promotion = Promotion::findOrFail($promotionId);
        $promotion->update(['is_active' => false]);

        return $promotion;
    }
}
