# Fix 03: Missing Backend Endpoints

## Issue Summary
The guest frontend service (`guest.service.ts`) calls several API endpoints that don't exist on the backend:
1. `POST /guest/change-password` - Change password
2. `DELETE /guest/account` - Delete account
3. `PUT /guest/notifications` - Update notification preferences
4. `POST /guest/loyalty/redeem` - Redeem loyalty points

## Current Frontend Calls

### guest.service.ts
```typescript
async updatePassword(currentPassword: string, newPassword: string) {
  const response = await api.post('/guest/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  return response.data
},

async deleteAccount() {
  const response = await api.delete('/guest/account')
  return response.data
},

async updateNotificationPreferences(prefs: NotificationPreferences) {
  const response = await api.put('/guest/notifications', prefs)
  return response.data
},

async redeemPoints(points: number, description: string) {
  const response = await api.post('/guest/loyalty/redeem', { points, description })
  return response.data
},
```

## Files to Modify

1. **Add routes**: `backend/routes/api.php`
2. **Add methods**: `backend/app/Http/Controllers/Api/GuestController.php`

## Implementation Steps

### Step 1: Add Methods to GuestController

**File**: `backend/app/Http/Controllers/Api/GuestController.php`

Add after line 128:

```php
public function changePassword(Request $request): JsonResponse
{
    $guest = $request->user();

    $validator = Validator::make($request->all(), [
        'current_password' => 'required|string',
        'new_password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    if (! Hash::check($request->current_password, $guest->password_hash)) {
        return response()->json(['error' => 'Current password is incorrect'], 401);
    }

    $guest->update(['password_hash' => Hash::make($request->new_password)]);

    return response()->json(['message' => 'Password changed successfully']);
}

public function updateNotifications(Request $request): JsonResponse
{
    $guest = $request->user();

    $validator = Validator::make($request->all(), [
        'notification_email' => 'sometimes|boolean',
        'notification_sms' => 'sometimes|boolean',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $guest->update($validator->validated());

    return response()->json([
        'message' => 'Notification preferences updated',
        'notifications' => [
            'notification_email' => $guest->notification_email,
            'notification_sms' => $guest->notification_sms,
        ],
    ]);
}

public function redeemLoyaltyPoints(Request $request): JsonResponse
{
    $guest = $request->user();

    if (!$guest->is_loyalty_member) {
        return response()->json(['error' => 'Not a loyalty member'], 400);
    }

    $validator = Validator::make($request->all(), [
        'points' => 'required|integer|min:100',
        'description' => 'nullable|string|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $points = $request->points;

    if ($points > $guest->loyalty_points) {
        return response()->json(['error' => 'Insufficient points'], 400);
    }

    $validRedemptions = [
        1000 => ['type' => 'discount', 'amount' => 10, 'name' => '€10 discount'],
        2500 => ['type' => 'discount', 'amount' => 25, 'name' => '€25 discount'],
        5000 => ['type' => 'free_night', 'name' => 'Free night (base)'],
    ];

    if (!isset($validRedemptions[$points])) {
        return response()->json(['error' => 'Invalid redemption amount'], 400);
    }

    $guest->decrement('loyalty_points', $points);
    $reward = $validRedemptions[$points];

    AuditLog::log('loyalty_redeemed', 'guest', $guest->id, null, [
        'points_redeemed' => $points,
        'reward' => $reward,
        'description' => $request->description,
    ]);

    return response()->json([
        'message' => 'Points redeemed successfully',
        'reward' => $reward,
        'remaining_points' => $guest->fresh()->loyalty_points,
    ]);
}

public function deleteAccount(Request $request): JsonResponse
{
    $guest = $request->user();

    $validator = Validator::make($request->all(), [
        'password' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    if (! Hash::check($request->password, $guest->password_hash)) {
        return response()->json(['error' => 'Password is incorrect'], 401);
    }

    AuditLog::log('account_deleted', 'guest', $guest->id, null, [
        'email' => $guest->email,
        'deleted_at' => now()->toIso8601String(),
    ]);

    $guest->bookings()->delete();
    $guest->reviews()->delete();
    $guest->delete();

    return response()->json(['message' => 'Account deleted successfully']);
}
```

### Step 2: Add Imports to GuestController

Add these imports at the top of the file (after existing imports):
```php
use Illuminate\Support\Facades\Hash;
```

Note: Also need to add `AuditLog` import - check if it exists:
```php
use App\Models\AuditLog; // or wherever it's located
```

### Step 3: Add Routes

**File**: `backend/routes/api.php`
**Location**: Lines 65-70 (inside guest middleware group)

Replace current guest routes:
```php
Route::prefix('guest')->middleware(['auth.jwt'])->group(function () {
    Route::get('/profile', [GuestController::class, 'profile']);
    Route::put('/profile', [GuestController::class, 'updateProfile']);
    Route::get('/bookings', [GuestController::class, 'bookings']);
    Route::get('/loyalty', [GuestController::class, 'loyalty']);
});
```

With:
```php
Route::prefix('guest')->middleware(['auth.jwt'])->group(function () {
    Route::get('/profile', [GuestController::class, 'profile']);
    Route::put('/profile', [GuestController::class, 'updateProfile']);
    Route::post('/change-password', [GuestController::class, 'changePassword']);
    Route::put('/notifications', [GuestController::class, 'updateNotifications']);
    Route::delete('/account', [GuestController::class, 'deleteAccount']);
    Route::get('/bookings', [GuestController::class, 'bookings']);
    Route::get('/loyalty', [GuestController::class, 'loyalty']);
    Route::post('/loyalty/redeem', [GuestController::class, 'redeemLoyaltyPoints']);
});
```

## API Endpoints Added

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/guest/change-password | Change guest password |
| PUT | /api/guest/notifications | Update notification preferences |
| DELETE | /api/guest/account | Delete guest account |
| POST | /api/guest/loyalty/redeem | Redeem loyalty points |

## Testing

1. Run `php artisan route:list | grep guest`
2. Test change password: `POST /api/guest/change-password`
3. Test notifications: `PUT /api/guest/notifications`
4. Test loyalty redeem: `POST /api/guest/loyalty/redeem`
5. Test delete account: `DELETE /api/guest/account`

## Notes
- The delete account uses soft delete or hard delete? Currently hard delete. Consider adding soft deletes to Guest model.
- The loyalty redeem needs an AuditLog - check if it exists or use a simple DB::table log