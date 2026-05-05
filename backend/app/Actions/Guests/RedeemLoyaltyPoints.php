<?php

namespace App\Actions\Guests;

use App\DTO\RedeemLoyaltyPointsDTO;
use App\Models\Guest;
use App\Services\LoyaltyService;

readonly class RedeemLoyaltyPoints
{
    public function __construct(
        private LoyaltyService $loyaltyService,
    ) {}

    public function handle(Guest $guest, RedeemLoyaltyPointsDTO $dto): array
    {
        if (! $guest->is_loyalty_member) {
            throw new \Exception('Not a loyalty member');
        }

        $points = $dto->points;

        if ($points > $guest->loyalty_points) {
            throw new \Exception('Insufficient points');
        }

        $validRedemptions = $this->loyaltyService->getValidRedemptions();

        if (! isset($validRedemptions[$points])) {
            throw new \Exception('Invalid redemption amount');
        }

        $guest->decrement('loyalty_points', $points);
        $reward = $validRedemptions[$points];

        Log::info('Loyalty points redeemed', [
            'guest_id' => $guest->id,
            'points_redeemed' => $points,
            'reward' => $reward,
            'description' => $dto->description,
        ]);

        return [
            'reward' => $reward,
            'remaining_points' => $guest->fresh()->loyalty_points,
        ];
    }
}
