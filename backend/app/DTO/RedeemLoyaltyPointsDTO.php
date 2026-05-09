<?php

declare(strict_types=1);

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

    public static function fromArray(array $data): self
    {
        return new self(
            points: $data['points'] ?? 0,
            description: $data['description'] ?? null,
        );
    }
}
