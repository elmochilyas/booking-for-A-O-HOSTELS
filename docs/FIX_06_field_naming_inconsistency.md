# Fix 06: Field Naming Inconsistency

## Issue Summary
The backend uses snake_case (`first_name`, `date_of_birth`, `is_loyalty_member`) while frontend expects camelCase (`firstName`, `dateOfBirth`, `aoClubMember`). This causes data mapping issues throughout the guest system.

## Field Comparison

| Backend (snake_case) | Frontend (camelCase) | Context |
|---------------------|----------------------|---------|
| `first_name` | `firstName` | Profile |
| `last_name` | `lastName` | Profile |
| `date_of_birth` | `dateOfBirth` | Profile |
| `email_verified_at` | `isEmailVerified` | Profile (transformed) |
| `is_loyalty_member` | `aoClubMember` | Profile (renamed) |
| `created_at` | `createdAt` | Everywhere |
| `updated_at` | `updatedAt` | Everywhere |

## Impact Areas

1. **Profile endpoint** (`GET /api/guest/profile`) - returns snake_case
2. **Bookings endpoint** - guest data in nested objects
3. **Admin guest list** - returns snake_case
4. **Frontend types** - expect camelCase

## Files to Modify

1. **Backend**: `backend/app/Http/Controllers/Api/GuestController.php`
2. **Backend**: `backend/app/Modules/Admin/Controllers/AdminController.php`
3. **Optional**: Create a API Resource/Transformer for consistent response formatting

## Implementation

### Approach: Add Resource/Transformer Layer

Create a Laravel API Resource to transform data consistently. This is the cleanest approach.

#### Step 1: Create GuestResource

**File**: `backend/app/Http/Resources/GuestResource.php`

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'phone' => $this->phone,
            'country' => $this->country,
            'dateOfBirth' => $this->date_of_birth?->toDateString(),
            'address' => $this->address,
            'gender' => $this->gender,
            'isEmailVerified' => !is_null($this->email_verified_at),
            'aoClubMember' => $this->is_loyalty_member,
            'loyaltyPoints' => $this->loyalty_points,
            'memberSince' => $this->created_at?->toDateString(),
            'notifications' => [
                'notificationEmail' => $this->notification_email ?? true,
                'notificationSms' => $this->notification_sms ?? false,
            ],
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
```

#### Step 2: Update GuestController Profile Endpoint

**File**: `backend/app/Http/Controllers/Api/GuestController.php`

Add import at top:
```php
use App\Http\Resources\GuestResource;
```

Update profile method:
```php
public function profile(Request $request): JsonResponse
{
    $guest = $request->user();

    return response()->json([
        'guest' => new GuestResource($guest),
    ]);
}
```

Update updateProfile method to return the resource:
```php
public function updateProfile(Request $request): JsonResponse
{
    $guest = $request->user();

    $validator = Validator::make($request->all(), [
        'first_name' => 'sometimes|string|max:100',
        'last_name' => 'sometimes|string|max:100',
        'phone' => 'nullable|string|max:20',
        'country' => 'nullable|string|max:100',
        'date_of_birth' => 'nullable|date',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $guest->update($validator->validated());

    return response()->json([
        'message' => 'Profile updated successfully',
        'guest' => new GuestResource($guest),
    ]);
}
```

#### Step 3: Update Loyalty Response

Update the loyalty method in GuestController to include transformed guest data:

```php
// After joining loyalty
return response()->json([
    'message' => 'Welcome to A&O Club! You now get 25% off all bookings.',
    'guest' => new GuestResource($guest->fresh()),
    'is_member' => true,
    'discount' => '25%',
]);
```

#### Step 4: Update Admin Guest List Response

**File**: `backend/app/Modules/Admin/Controllers/AdminController.php`

Update getGuests method (around line 384-397):

```php
return response()->json([
    'data' => $guests->map(fn ($g) => [
        'id' => $g->id,
        'firstName' => $g->first_name,
        'lastName' => $g->last_name,
        'email' => $g->email,
        'phone' => $g->phone,
        'country' => $g->country,
        'isLoyaltyMember' => (bool) $g->is_loyalty_member,
        'loyaltyPoints' => $g->loyalty_points,
        'isBanned' => (bool) ($g->is_banned ?? false),
        'bookingsCount' => $g->bookings()->count(),
        'memberSince' => $g->created_at?->toDateString(),
    ]),
    'pagination' => [
        'current_page' => $guests->currentPage(),
        'last_page' => $guests->lastPage(),
        'total' => $guests->total(),
    ],
]);
```

## Testing

1. Call `GET /api/guest/profile` - verify camelCase response
2. Call `GET /api/admin/guests` - verify camelCase in data array
3. Update profile - verify response uses camelCase

## Frontend Adjustments

After backend changes, update any field names that might still differ:

**File**: `frontend/guest/src/types/guest.types.ts`

Update to match:
```typescript
export interface Guest {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  country?: string
  dateOfBirth?: string
  address?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  isEmailVerified: boolean
  aoClubMember: boolean
  loyaltyPoints: number
  memberSince: string
  notifications: {
    notificationEmail: boolean
    notificationSms: boolean
  }
  createdAt: string
  updatedAt: string
}
```

## Notes
- This approach uses Laravel API Resources - the standard way to transform responses
- The resource handles the snake_case → camelCase transformation in one place
- Benefits also get camelCased (`notificationEmail`, `notificationSms`)
- Consistency: Both profile and admin endpoints now use the same transformation