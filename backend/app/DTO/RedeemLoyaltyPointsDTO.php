<?php

namespace App\DTO;

use App\Http\Requests\Api\Guest\RedeemLoyaltyPointsRequest;

readonly class RedeemLoyaltyPointsDTO
{
    public function __construct(
        public int $points,
        public ?string $description = null,
    ) {}

    public static function fromRequest(RedeemLoyaltyPointsRequest $request): self
    {
        return new self(
            points: $request->validated('points'),
            description: $request->validated('description'),
        );
    }
}
