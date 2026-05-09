<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Models\Promotion;
use Illuminate\Support\Str;

readonly class CreatePromotionAction
{
    public function handle(array $data): Promotion
    {
        return Promotion::create([
            'id' => Str::uuid()->toString(),
            'property_id' => $data['property_id'] ?? null,
            'name' => $data['code'],
            'description' => $data['description'] ?? null,
            'discount_type' => $data['discount_type'],
            'discount_value' => $data['discount_value'],
            'promo_code' => $data['code'],
            'start_date' => $data['valid_from'],
            'end_date' => $data['valid_until'],
            'min_nights' => $data['min_booking_value'] ?? null,
            'is_active' => true,
            'usage_limit' => $data['max_uses'] ?? null,
            'usage_count' => 0,
        ]);
    }
}
