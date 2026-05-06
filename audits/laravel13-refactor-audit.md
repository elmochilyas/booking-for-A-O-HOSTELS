# Laravel 13 Refactor — Deep Audit Report

**Branch:** `feature/laravel13-refactor`
**Date:** 2026-05-06
**Rules file:** `.opencode/laravel13-expert-rules.md`
**Verdict:** ❌ BLOCK — Do not merge

---

## Summary Table

| Severity | Count |
|---|---|
| 🔴 CRITICAL | 6 |
| 🟠 HIGH | 11 |
| 🟡 MEDIUM | 14 |
| 🔵 LOW | 4 |

---

## What's Working ✅

The refactor is structurally sound in completed areas:
- Actions are correctly `readonly` classes
- DTOs have `fromRequest`/`fromArray` named constructors
- Repositories implement interfaces from `app/Contracts/`
- Events use `ShouldDispatchAfterCommit` (G-06) ✅
- Jobs use PHP 8.1 attribute-based config (`#[Tries]`, `#[Backoff]`, etc.) ✅
- `bootstrap/app.php` used for middleware — no Kernel.php ✅
- Model observers use `#[ObservedBy]` attribute (mostly) ✅

---

## 🔴 CRITICAL Issues

### [C-01] `AdminController` — 944-line god-controller (G-01/A-01)
**File:** `backend/app/Modules/Admin/Controllers/AdminController.php`

Massive business logic directly in controller:
- `getAnalytics()` (lines 726–809): 84 lines with N+1 loop queries (19 DB queries per request)
- `getReviews()`, `getPromotions()`, `getExtras()`, `getRooms()`: direct Eloquent, no repositories
- `createRoom()`, `updateRoom()`, `createRoomType()`, `updateRoomType()`: direct `Model::create()` bypassing Actions/repos
- `updateEmailTemplate()`: direct Eloquent update in controller
- `exportBookings()`: streaming CSV generation entirely in controller
- Lines 81, 118, 129, 138, 190, 224, 235, 257, 283, 352, 378, 489, 673, 732: string-based `app('App\Contracts\...')` bypasses type-safe DI

**Fix:** Extract each logical block into dedicated Actions. Inject repositories via constructor. Move all Eloquent access to repositories.

---

### [C-02] `BookingController` — undefined imports, broken Action calls
**File:** `backend/app/Modules/Bookings/Controllers/BookingController.php`

- Line 46: `CreateBookingDTO` never imported → `Class not found` fatal error
- Line 70: `$action->handle($id)` passes string ID, but `CancelBooking::handle()` requires `(Booking $booking, string $reason)` → fatal type error
- Line 90: `CancelBookingRequest` never imported
- Lines 71, 82, 92, 111, 121: Checking `['success']` key on Actions that return typed model objects

**Fix:** Add missing `use` imports; fix Action call signatures.

---

### [C-03] `PropertyController` — undefined DTO imports
**File:** `backend/app/Modules/Properties/Controllers/PropertyController.php`

- Line 35: `CreatePropertyDTO` never imported → fatal on `store()`
- Line 53: `UpdatePropertyDTO` never imported → fatal on `update()`

---

### [C-04] `StaffController` — undefined DTO imports
**File:** `backend/app/Modules/Staff/Controllers/StaffController.php`

- Line 31: `CreateStaffDTO` never imported → fatal on `store()`
- Line 49: `UpdateStaffDTO` never imported → fatal on `update()`

---

### [C-05] `RedeemLoyaltyPoints` — missing `Log` import, crashes on every execution
**File:** `backend/app/Actions/Guests/RedeemLoyaltyPoints.php` line 36

`Log::info(...)` called but `use Illuminate\Support\Facades\Log;` is absent → fatal error on every successful loyalty redemption.

---

### [C-06] `CheckoutContext` DTO — readonly mutation crash + copy-paste bug
**File:** `backend/app/DTO/CheckoutContext.php`

- `calculateTotal()` assigns to `$this->total` but the class is `readonly` → fatal `Cannot modify readonly property` at runtime
- `fromDTO` named constructor sets `bookingId: $dto->propertyId` → wrong value, copy-paste bug

---

## 🟠 HIGH Issues

### [H-01] `HandlePaymentSucceeded` — bypasses repositories, no `DB::transaction()`
**File:** `backend/app/Actions/Payments/HandlePaymentSucceeded.php`
- Direct `Payment::where(...)->first()` and `->update()` instead of repository (REPO-02)
- Multi-model writes (`$payment->update`, `$booking->update`) not wrapped in transaction (G-05)

### [H-02] `RefundPayment` — no `DB::transaction()` for multi-model writes
**File:** `backend/app/Actions/Payments/RefundPayment.php`
- Creates Payment record + updates `$booking->payment_status` without transaction
- Orphaned Payment row if booking update fails

### [H-03] `CheckInBooking` — dispatches event but no transaction
**File:** `backend/app/Actions/Bookings/CheckInBooking.php`
- Booking update (line 23) not in transaction
- `ShouldDispatchAfterCommit` is meaningless without an actual transaction

### [H-04] `WebhookController` — unprotected endpoint, non-PSR import
**File:** `backend/app/Modules/Payments/Controllers/WebhookController.php`
- `\Log::` root-namespace alias (line 47) — non-PSR-12
- No `#[Middleware]` attribute — webhook endpoint has no auth/rate-limit declared

### [H-05] `ReportController` (Api) — resolves via `app()`, no FormRequest
**File:** `backend/app/Http/Controllers/Api/ReportController.php`
- All handlers resolved via `app(...)` instead of DI (lines 43, 65–78)
- Raw `request()->get()` used without FormRequest (G-08)

### [H-06] `CheckoutContext` — also violates DTO-01 immutability
See C-06 above.

### [H-07] `CreateRoomDTO` — uses `string` for `status` instead of `RoomStatus` enum
**File:** `backend/app/DTO/CreateRoomDTO.php` line 14
`?string $status = 'available'` → should be `?RoomStatus` (G-07)

### [H-08] `Booking` model — `BookingObserver` not registered via `#[ObservedBy]`
**File:** `backend/app/Models/Booking.php`
Missing `#[ObservedBy([BookingObserver::class])]` attribute (OBS-08). Observer presumably registered elsewhere.

### [H-09] `PaymentService` (Modules) — parallel duplicate of Actions
**File:** `backend/app/Modules/Payments/Services/PaymentService.php`
Re-implements `createPaymentIntent`, `confirmPayment`, `processRefund`, `calculateTotalPaid` — all have equivalent Actions. Two implementations will silently diverge.

### [H-10] `AdminController::getAnalytics()` — 19 N+1 queries in loops
**File:** `backend/app/Modules/Admin/Controllers/AdminController.php` lines 752–775
Two `for` loops execute individual DB queries for 7 days + 12 months = 19 extra queries per analytics request.

### [H-11] `AdminController::getGuests()` — N+1 on `bookings()->count()`
**File:** `backend/app/Modules/Admin/Controllers/AdminController.php` line 365
`$g->bookings()->count()` inside `->map()` over paginated guests = 20 extra queries per page. Use `withCount('bookings')`.

---

## 🟡 MEDIUM Issues

### [M-01] `AuthController::verifyEmail()` — inline validation instead of FormRequest (G-08)
**File:** `backend/app/Http/Controllers/Api/AuthController.php` line 81

### [M-02] Four events missing `SerializesModels` (EVT-02)
`BookingCancelled`, `GuestCheckedIn`, `GuestCheckedOut`, `PaymentRefunded` — all have Eloquent model properties and `ShouldDispatchAfterCommit` but missing `use SerializesModels;`

### [M-03] `CreateBookingDTO::fromArray()` — unsafe enum coercion without null guard
**File:** `backend/app/DTO/CreateBookingDTO.php` line 52
`PaymentMethod::from($data['payment_method'])` throws `ValueError` if key absent.

### [M-04] `LoginStaff` — throws generic `\Exception` instead of `InvalidCredentialsException`
**File:** `backend/app/Actions/Staff/LoginStaff.php` lines 21, 25

### [M-05] `RedeemLoyaltyPoints` — no `DB::transaction()` around decrement + reward
**File:** `backend/app/Actions/Guests/RedeemLoyaltyPoints.php`
Guest can be debited without receiving reward if partial failure occurs.

### [M-06] `StaffController` (Api) — fat constructor with 11 dependencies (A-01)
**File:** `backend/app/Http/Controllers/Api/StaffController.php` lines 30–42
`StaffRepositoryInterface` should not be in the controller — inject per-method via Action.

### [M-07] `GetBookingPayments` Action has second public method (ACT-01)
`calculateTotalPaid()` is a second public method — violates one-public-handle rule.

### [M-08] `AdminController` — string-based `app('...')` instead of DI (G-10)
14 occurrences. Defeats IDE analysis and testability.

### [M-09] `WebhookController` — uses `switch` instead of `match` (PHP 8.1+ style)
**File:** `backend/app/Modules/Payments/Controllers/WebhookController.php`

### [M-10] Six models use `boot()` for UUID instead of `HasUuids` trait
`Booking`, `Guest`, `Property`, `Room`, `RoomType`, `Payment` — all define `static::creating()` boot listener. Use Laravel's `HasUuids` trait instead.

### [M-11] `Booking` model — redundant `#[Table key:]` + `$primaryKey` property
**File:** `backend/app/Models/Booking.php` lines 15, 31–32. One is redundant.

### [M-12] `EmailNotificationService` — silently swallows exceptions
**File:** `backend/app/Modules/Notifications/Services/EmailNotificationService.php` lines 115–127
`catch (\Exception $e) { \Log::error(...) }` — callers cannot know email failed.

### [M-13] `BookingObserver` — enforces business rules (violates OBS-08)
**File:** `backend/app/Observers/BookingObserver.php` lines 30–39
Status transition validation belongs in Actions, not observers. Dual enforcement will diverge.

### [M-14] `CreatePaymentIntent` — hardcoded `'eur'` magic string
**File:** `backend/app/Actions/Payments/CreatePaymentIntent.php` lines 35, 55
Use `config('payments.currency')`.

---

## 🔵 LOW Issues

### [L-01] `declare(strict_types=1)` missing from all reviewed files
Required by project coding standards.

### [L-02] `AuthController` class-level `#[Middleware('guest')]` vs method-level `#[Middleware('auth.jwt')]` — non-obvious stacking
**File:** `backend/app/Http/Controllers/Api/AuthController.php` line 25

### [L-03] `ProcessPaymentWebhook` — redundant `ShouldQueue` interface import style
**File:** `backend/app/Jobs/ProcessPaymentWebhook.php` line 21. Clean up to explicit `implements` + `use Queueable, InteractsWithQueue;`.

### [L-04] `AdminController::getAnalytics()` — unvalidated `request()->get('property_id')`
**File:** `backend/app/Modules/Admin/Controllers/AdminController.php` lines 727–728

---

## Priority Fix Order

**Sprint 1 — Fix crashes (CRITICAL):**
1. Add missing `use` imports to `BookingController`, `PropertyController`, `StaffController`
2. Fix `CancelBooking` call signature in `BookingController`
3. Add `use Illuminate\Support\Facades\Log;` to `RedeemLoyaltyPoints`
4. Fix `CheckoutContext`: remove `calculateTotal()` mutation OR convert to non-readonly with a builder; fix `bookingId` copy-paste bug

**Sprint 2 — Fix data integrity (HIGH):**
5. Wrap `HandlePaymentSucceeded` and `RefundPayment` writes in `DB::transaction()`
6. Add `DB::transaction()` to `CheckInBooking`
7. Move `PaymentService` duplicates — delete or consolidate
8. Fix N+1 in `getAnalytics()` and `getGuests()` (replace loops with grouped queries + `withCount`)
9. Add `#[ObservedBy([BookingObserver::class])]` to `Booking` model

**Sprint 3 — Architecture cleanup (HIGH/MEDIUM):**
10. Extract `AdminController` analytics/reporting into Actions and Query Handlers
11. Add FormRequest to `ReportController` (Api) and `AuthController::verifyEmail()`
12. Add `use SerializesModels;` to the four events
13. Change `CreateRoomDTO::$status` to `?RoomStatus`
14. Replace `LoginStaff` generic exception with `InvalidCredentialsException`

**Sprint 4 — Code quality (MEDIUM/LOW):**
15. Add `declare(strict_types=1)` to all PHP files (enforce via Pint)
16. Replace `boot()` UUID logic with `HasUuids` trait
17. Replace `switch` with `match` in `WebhookController`
18. Remove redundant `$primaryKey` or `#[Table key:]` from Booking/Guest models
19. Fix `EmailNotificationService` to propagate exceptions
20. Move status transition validation out of `BookingObserver` into Actions
