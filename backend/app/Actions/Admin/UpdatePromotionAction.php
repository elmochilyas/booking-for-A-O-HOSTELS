<?php

namespace App\Actions\Admin;

use App\Models\Promotion;

readonly class UpdatePromotionAction
{
    public function handle(Promotion $promotion, array $data): Promotion
    {
        $updateData = [];

        if (isset($data['code'])) {
            $updateData['promo_code'] = $data['code'];
            $updateData['name'] = $data['code'];
        }
        if (isset($data['description'])) {
            $updateData['description'] = $data['description'];
        }
        if (isset($data['discount_type'])) {
            $updateData['discount_type'] = $data['discount_type'];
        }
        if (isset($data['discount_value'])) {
            $updateData['discount_value'] = $data['discount_value'];
        }
        if (array_key_exists('property_id', $data)) {
            $updateData['property_id'] = $data['property_id'];
        }
        if (isset($data['valid_from'])) {
            $updateData['start_date'] = $data['valid_from'];
        }
        if (isset($data['valid_until'])) {
            $updateData['end_date'] = $data['valid_until'];
        }
        if (isset($data['min_booking_value'])) {
            $updateData['min_nights'] = $data['min_booking_value'];
        }
        if (isset($data['max_uses'])) {
            $updateData['usage_limit'] = $data['max_uses'];
        }
        if (array_key_exists('is_active', $data)) {
            $updateData['is_active'] = $data['is_active'];
        }

        $promotion->update($updateData);

        return $promotion->fresh();
    }
}
