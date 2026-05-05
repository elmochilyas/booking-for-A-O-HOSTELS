# Fix 05: Loyalty Response Structure Mismatch

## Issue Summary
The backend and frontend have different expectations for the loyalty API response structure. This causes data not to display properly in the frontend.

## Current Backend Response

### Endpoint: GET /api/guest/loyalty
**File**: `backend/app/Http/Controllers/Api/GuestController.php` (lines 64-76)

```php
public function loyalty(Request $request): JsonResponse
{
    $guest = $request->user();

    return response()->json([
        'is_member' => $guest->is_loyalty_member,
        'points' => $guest->loyalty_points,
        'points_value' => $guest->loyalty_points * 0.01,
        'tier' => $this->getLoyaltyTier($guest->loyalty_points),
        'points_to_next_tier' => $this->getPointsToNextTier($guest->loyalty_points),
        'available_rewards' => $this->getAvailableRewards($guest->loyalty_points),
    ]);
}
```

**Returns:**
```json
{
  "is_member": true,
  "points": 1500,
  "points_value": 15,
  "tier": "Silver",
  "points_to_next_tier": 500,
  "available_rewards": [
    {"id": 1, "name": "€10 discount", "points": 1000, "discount": 10}
  ]
}
```

## Frontend Expected Structure

### File: `frontend/guest/src/types/guest.types.ts` (lines 30-39)

```typescript
export interface LoyaltyInfo {
  points: number
  tier: LoyaltyTier
  tierName: string
  pointsToNextTier: number
  lifetimePoints: number
  memberSince: string
  benefits: LoyaltyBenefit[]
  history: LoyaltyTransaction[]
}
```

**Expected:**
```json
{
  "points": 1500,
  "tier": "silver",
  "tierName": "Silver",
  "pointsToNextTier": 500,
  "lifetimePoints": 2500,
  "memberSince": "2025-01-15",
  "benefits": [...],
  "history": [...]
}
```

## Differences

| Field | Backend | Frontend |
|-------|---------|----------|
| Member status | `is_member` | N/A (assume if points > 0) |
| Current points | `points` | `points` ✓ |
| Points value | `points_value` | Missing |
| Tier | `tier` (full name) | `tier` (lowercase) + `tierName` |
| Points to next | `points_to_next_tier` | `pointsToNextTier` (camelCase) |
| Lifetime points | Missing | `lifetimePoints` |
| Member since | Missing | `memberSince` |
| Benefits | Missing | `benefits` array |
| Transaction history | Missing | `history` array |

## Files to Modify

1. **Backend**: `backend/app/Http/Controllers/Api/GuestController.php`
2. **Frontend**: `frontend/guest/src/types/guest.types.ts` (if needed)
3. **Frontend**: `frontend/guest/src/services/guest.service.ts`

## Implementation

### Option A: Update Backend to Match Frontend (Recommended)

Update GuestController loyalty method to return the structure frontend expects.

**File**: `backend/app/Http/Controllers/Api/GuestController.php`
**Location**: Lines 64-76

Replace the entire loyalty method:

```php
public function loyalty(Request $request): JsonResponse
{
    $guest = $request->user();

    if (!$guest->is_loyalty_member) {
        return response()->json([
            'is_member' => false,
            'points' => 0,
            'tier' => 'bronze',
            'tierName' => 'Bronze',
            'pointsToNextTier' => 2000,
            'lifetimePoints' => 0,
            'memberSince' => null,
            'benefits' => [],
            'history' => [],
        ]);
    }

    $tier = $this->getLoyaltyTier($guest->loyalty_points);
    $tierName = $tier;

    $benefits = $this->getLoyaltyBenefits($tier);
    $history = $this->getLoyaltyHistory($guest->id);

    return response()->json([
        'is_member' => true,
        'points' => $guest->loyalty_points,
        'tier' => strtolower($tier),
        'tierName' => $tierName,
        'pointsToNextTier' => $this->getPointsToNextTier($guest->loyalty_points),
        'lifetimePoints' => $guest->loyalty_points,
        'memberSince' => $guest->created_at?->toDateString(),
        'benefits' => $benefits,
        'history' => $history,
    ]);
}

private function getLoyaltyBenefits(string $tier): array
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

    return array_filter($allBenefits, function ($benefit) use ($userTierIndex, $tierOrder) {
        $benefitTierIndex = $tierOrder[$benefit['requiredTier']] ?? 0;
        return $benefitTierIndex <= $userTierIndex;
    });
}

private function getLoyaltyHistory(string $guestId): array
{
    // For now, return empty - would need loyalty_points_transactions table
    // In future, query: LoyaltyTransaction::where('guest_id', $guestId)->get()
    return [];
}
```

### Alternative: Keep Both Approaches Compatible

If you want to maintain compatibility with both old and new frontends, add a version parameter or add both fields.

```php
return response()->json([
    // New format
    'is_member' => $guest->is_loyalty_member,
    'points' => $guest->loyalty_points,
    'tier' => strtolower($tier),
    'tierName' => $tierName,
    'pointsToNextTier' => $this->getPointsToNextTier($guest->loyalty_points),
    'lifetimePoints' => $guest->loyalty_points,
    'memberSince' => $guest->created_at?->toDateString(),
    'benefits' => $benefits,
    'history' => $history,
    
    // Legacy format (for backward compatibility)
    'points_value' => $guest->loyalty_points * 0.01,
    'available_rewards' => $this->getAvailableRewards($guest->loyalty_points),
]);
```

## Testing

1. Register a new guest
2. Call `GET /api/guest/loyalty` - should return non-member response
3. Call `POST /api/guest/loyalty/join` to join
4. Call `GET /api/guest/loyalty` again - verify structure matches frontend types

## Notes
- The `history` field is empty because there's no loyalty transactions table yet
- `lifetimePoints` currently equals `points` - could track separately if needed
- Benefits are hardcoded here - could move to database/config in future