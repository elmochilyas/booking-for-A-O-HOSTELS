# Fix 01: Missing is_banned Columns in Guests Table

## Issue Summary
The admin ban/unban functionality in `AdminManagementService.php` references `is_banned` and `ban_reason` columns that don't exist in the database, causing these endpoints to fail with SQL errors.

## Current Code Using These Fields

### AdminManagementService.php (lines 476-487)
```php
public function banGuest(string $id, ?string $reason = null): Guest
{
    return $this->updateGuest($id, [
        'is_banned' => true,
        'ban_reason' => $reason,
    ]);
}

public function unbanGuest(string $id): Guest
{
    return $this->updateGuest($id, [
        'is_banned' => false,
        'ban_reason' => null,
    ]);
}
```

### AdminController.php (line 394)
```php
'is_banned' => $g->is_banned,
```

## Files to Modify

1. **Create new migration**: `backend/database/migrations/2026_05_04_000002_add_ban_fields_to_guests_table.php`
2. **Update Guest model** (if needed): `backend/app/Models/Guest.php`

## Implementation Steps

### Step 1: Create Migration
Create a new migration file with timestamp after the latest migration (2026_05_04_000001).

**File**: `backend/database/migrations/2026_05_04_000002_add_ban_fields_to_guests_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->boolean('is_banned')->default(false)->after('notification_sms');
            $table->text('ban_reason')->nullable()->after('is_banned');
            $table->timestamp('banned_at')->nullable()->after('ban_reason');
        });
    }

    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropColumn(['is_banned', 'ban_reason', 'banned_at']);
        });
    }
};
```

### Step 2: Update Guest Model (Optional - Add to $casts)
Add `is_banned` to the casts array for automatic boolean conversion.

**File**: `backend/app/Models/Guest.php`

Add to line 46 (after notification_sms cast):
```php
'is_banned' => 'boolean',
'banned_at' => 'datetime',
```

## API Endpoints Affected
- `PUT /api/admin/guests/{id}` - Returns is_banned in response
- `POST /api/admin/guests/{id}/ban` - Sets is_banned=true
- `POST /api/admin/guests/{id}/unban` - Sets is_banned=false

## Testing
After applying migration:
1. Run `php artisan migrate`
2. Test ban endpoint: `POST /api/admin/guests/{id}/ban`
3. Test unban endpoint: `POST /api/admin/guests/{id}/unban`
4. Verify is_banned appears in guests list response

## Rollback Plan
Run migration down: `php artisan migrate:rollback`