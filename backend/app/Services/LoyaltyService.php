<?php

declare(strict_types=1);

namespace App\Services;

readonly class LoyaltyService
{
    public function getLoyaltyTier(int $points): string
    {
        if ($points >= 5000) {
            return 'Gold';
        }
        if ($points >= 2000) {
            return 'Silver';
        }

        return 'Bronze';
    }

    public function getPointsToNextTier(int $points): ?int
    {
        if ($points < 2000) {
            return 2000 - $points;
        }
        if ($points < 5000) {
            return 5000 - $points;
        }

        return null;
    }

    public function getLoyaltyBenefits(string $tier): array
    {
        $allBenefits = [
            [
                'id' => 'bronze_1',
                'name' => '5% off all bookings',
                'description' => 'Get 5% discount on every booking',
                'requiredTier' => 'bronze',
                'discount' => 5,
                'active' => true,
            ],
            [
                'id' => 'bronze_2',
                'name' => 'Member-only deals',
                'description' => 'Access to exclusive member pricing',
                'requiredTier' => 'bronze',
                'active' => true,
            ],
            [
                'id' => 'silver_1',
                'name' => '10% off all bookings',
                'description' => 'Get 10% discount on every booking',
                'requiredTier' => 'silver',
                'discount' => 10,
                'active' => true,
            ],
            [
                'id' => 'silver_2',
                'name' => 'Early check-in',
                'description' => 'Request early check-in (subject to availability)',
                'requiredTier' => 'silver',
                'active' => true,
            ],
            [
                'id' => 'gold_1',
                'name' => '15% off all bookings',
                'description' => 'Get 15% discount on every booking',
                'requiredTier' => 'gold',
                'discount' => 15,
                'active' => true,
            ],
            [
                'id' => 'gold_2',
                'name' => 'Free room upgrades',
                'description' => 'Subject to availability',
                'requiredTier' => 'gold',
                'active' => true,
            ],
        ];

        $tierOrder = ['bronze' => 0, 'silver' => 1, 'gold' => 2];
        $userTierIndex = $tierOrder[strtolower($tier)] ?? 0;

        return array_values(array_filter($allBenefits, function ($benefit) use ($userTierIndex, $tierOrder) {
            $benefitTierIndex = $tierOrder[$benefit['requiredTier']] ?? 0;

            return $benefitTierIndex <= $userTierIndex;
        }));
    }

    public function getAvailableRewards(int $points): array
    {
        $rewards = [
            ['id' => 1, 'name' => '€10 discount', 'points' => 1000, 'discount' => 10],
            ['id' => 2, 'name' => '€25 discount', 'points' => 2500, 'discount' => 25],
            ['id' => 3, 'name' => 'Free night (base)', 'points' => 5000, 'discount' => 'full'],
        ];

        return array_values(array_filter($rewards, fn ($r) => $points >= $r['points']));
    }

    public function getValidRedemptions(): array
    {
        return [
            1000 => ['type' => 'discount', 'amount' => 10, 'name' => '€10 discount'],
            2500 => ['type' => 'discount', 'amount' => 25, 'name' => '€25 discount'],
            5000 => ['type' => 'free_night', 'name' => 'Free night (base)'],
        ];
    }
}
