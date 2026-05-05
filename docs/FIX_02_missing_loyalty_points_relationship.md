# Fix 02: Missing loyaltyPoints Relationship

## Issue Summary
The `exportGuestData` method in `AdminManagementService.php` calls `$guest->loyaltyPoints()` but this relationship doesn't exist in the Guest model, causing the export feature to crash.

## Current Code (Broken)

### AdminManagementService.php (lines 508-520)
```php
public function exportGuestData(string $id): array
{
    $guest = Guest::findOrFail($id);

    return [
        'profile' => $guest->toArray(),
        'bookings' => $guest->bookings()->get()->toArray(),
        'reviews' => $guest->reviews()->get()->toArray(),
        'payments' => $guest->payments()->get()->toArray(),
        'loyalty_points' => $guest->loyaltyPoints()->get()->toArray(), // BROKEN
        'exported_at' => now()->toIso8601String(),
    ];
}
```

## Analysis

Looking at the Guest model and database:
- `loyalty_points` is stored as an integer column in the guests table
- There's no separate `loyalty_points` table
- The `loyaltyPoints()` call assumes a separate relationship table that doesn't exist

## Options

### Option A: Remove loyalty_points from export (Recommended for now)
Since loyalty points are just a number stored directly on the guest, we don't need a separate query.

### Option B: Create a loyalty_points table (Future enhancement)
Would require creating a full loyalty points system with transactions history.

## Files to Modify

1. **Fix**: `backend/app/Modules/Admin/Services/AdminManagementService.php`

## Implementation (Option A - Remove the broken call)

### Step 1: Update exportGuestData method

**File**: `backend/app/Modules/Admin/Services/AdminManagementService.php`
**Location**: Lines 508-520

Replace:
```php
'loyalty_points' => $guest->loyaltyPoints()->get()->toArray(),
```

With:
```php
'loyalty_points' => [
    'current_balance' => $guest->loyalty_points,
    'is_member' => $guest->is_loyalty_member,
],
```

This returns the loyalty data that's actually available (points as integer on guest table).

## API Endpoint Affected
- `GET /api/admin/guests/{id}/export`

## Testing
1. Run `php artisan migrate` (if not already done from Fix 01)
2. Create a guest via registration
3. Call `GET /api/admin/guests/{id}/export`
4. Verify response includes loyalty_points object

## Related
This is related to Fix 05 (loyalty response structure) - we should ensure consistency in how loyalty data is represented.