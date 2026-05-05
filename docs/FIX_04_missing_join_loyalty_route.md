# Fix 04: Missing joinLoyalty Route

## Issue Summary
The `GuestController` has a `joinLoyalty` method (lines 78-93) but there's no route to access it. Guests cannot join the loyalty program via API.

## Current Method in GuestController

```php
public function joinLoyalty(Request $request): JsonResponse
{
    $guest = $request->user();

    if ($guest->is_loyalty_member) {
        return response()->json(['error' => 'Already a member'], 400);
    }

    $guest->update(['is_loyalty_member' => true]);

    return response()->json([
        'message' => 'Welcome to A&O Club! You now get 25% off all bookings.',
        'is_member' => true,
        'discount' => '25%',
    ]);
}
```

## Issue Analysis
- Method exists in GuestController.php:78-93
- No route defined in routes/api.php
- Frontend likely needs this to allow guests to join loyalty program

## Files to Modify

1. **Add route**: `backend/routes/api.php`

## Implementation

### Add Route

**File**: `backend/routes/api.php`
**Location**: Inside the guest middleware group (around line 65-70)

Add to the guest routes:
```php
Route::post('/loyalty/join', [GuestController::class, 'joinLoyalty']);
```

Complete guest routes section should be:
```php
Route::prefix('guest')->middleware(['auth.jwt'])->group(function () {
    Route::get('/profile', [GuestController::class, 'profile']);
    Route::put('/profile', [GuestController::class, 'updateProfile']);
    Route::post('/change-password', [GuestController::class, 'changePassword']);
    Route::put('/notifications', [GuestController::class, 'updateNotifications']);
    Route::delete('/account', [GuestController::class, 'deleteAccount']);
    Route::get('/bookings', [GuestController::class, 'bookings']);
    Route::get('/loyalty', [GuestController::class, 'loyalty']);
    Route::post('/loyalty/join', [GuestController::class, 'joinLoyalty']);
    Route::post('/loyalty/redeem', [GuestController::class, 'redeemLoyaltyPoints']);
});
```

## API Endpoint Added

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/guest/loyalty/join | Join the loyalty program |

## Testing

1. Run `php artisan route:list | grep loyalty`
2. Call endpoint as non-member guest: `POST /api/guest/loyalty/join`
3. Verify response includes welcome message and discount
4. Call again as member - should return error

## Notes
- This endpoint is already implemented, just needs the route
- The discount shown (25%) is hardcoded - may want to make this configurable
- Consider adding initial loyalty points bonus on join (e.g., 100 points)