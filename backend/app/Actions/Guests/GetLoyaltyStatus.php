<?php

namespace App\Actions\Guests;

use App\Models\Guest;
use App\Services\LoyaltyService;

readonly class GetLoyaltyStatus
{
    public function __construct(
        private LoyaltyService $loyaltyService,
    ) {}

    public function handle(Guest $guest): array
    {
        if (! $guest->is_loyalty_member) {
            return [
                'is_member' => false,
                'points' => 0,
                'tier' => 'bronze',
                'tierName' => 'Bronze',
                'pointsToNextTier' => 2000,
                'lifetimePoints' => 0,
                'memberSince' => null,
                'benefits' => [],
                'history' => [],
                'available_rewards' => [],
            ];
        }

        $tier = $this->loyaltyService->getLoyaltyTier($guest->loyalty_points);
        $benefits = $this->loyaltyService->getLoyaltyBenefits($tier);

        return [
            'is_member' => true,
            'points' => $guest->loyalty_points,
            'tier' => strtolower($tier),
            'tierName' => $tier,
            'pointsToNextTier' => $this->loyaltyService->getPointsToNextTier($guest->loyalty_points),
            'lifetimePoints' => $guest->loyalty_points,
            'memberSince' => $guest->created_at?->toDateString(),
            'benefits' => $benefits,
            'history' => [],
            'available_rewards' => $this->loyaltyService->getAvailableRewards($guest->loyalty_points),
        ];
    }
}
