# Laravel 13 Refactoring Implementation Plan

**Project:** A-O-HOSTELS Booking Platform  
**Current Version:** Laravel 12, PHP 8.3+  
**Target Version:** Laravel 13, PHP 8.3+ (8.4, 8.5 supported)  
**Created:** 2026-05-05  
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Implementation Phases](#3-implementation-phases)
4. [Phase Details](#4-phase-details)
5. [Task Dependency Graph](#5-task-dependency-graph)
6. [File Structure Target](#6-file-structure-target)
7. [Success Metrics](#7-success-metrics)

---

## 1. Executive Summary

### Goals
Transform the codebase from a mixed-pattern Laravel 12 application to a clean, Laravel 13 expert-rules-compliant architecture.

### Key Changes
| Area | Current State | Target State |
|------|---------------|-------------|
| Laravel Version | 12.x | **13.x** |
| PHP Version | 8.3+ | **8.3+** (already compliant) |
| Controllers | Business logic in controllers | **Thin controllers → Actions only** |
| Validation | Inline Validator facade | **Form Requests** |
| Data Transfer | Raw arrays/Request | **DTOs (readonly)** |
| Data Access | Direct Eloquent | **Repositories + Interfaces** |
| Business Logic | Scattered in controllers | **Actions (handle() only)** |
| Fixed States | String constants | **PHP 8.3 Enums** |
| Auth Checks | Inline in controllers | **Policies + #[Authorize] attributes** |
| Events | None | **Event + Listener system** |
| Config Access | `config('key')` | **`config('key', as: 'type')`** |

### Estimated Effort
- **Total Tasks:** 47
- **Estimated Time:** 3-5 days
- **Risk Level:** Medium (well-planned incremental refactoring)

---

## 2. Current State Analysis

### 2.1 Architecture Overview

```
CURRENT STRUCTURE:
backend/
├── app/
│   ├── Http/Controllers/Api/     ← 10 controllers (business logic INSIDE)
│   ├── Modules/                   ← 7 modules (mixed: some use Services)
│   │   ├── Admin/Controllers/     (uses AdminManagementService)
│   │   ├── Bookings/Controllers/  (uses BookingService)
│   │   ├── Properties/Controllers/ (uses PropertyService)
│   │   ├── Staff/Controllers/     (uses StaffService)
│   │   └── ... (Payments, Notifications, Common)
│   ├── Services/                  ← Some services exist (JWT, Email, Stripe)
│   ├── Models/                    ← 16 models (mostly relationships only - GOOD)
│   └── Http/Middleware/           ← JwtAuthenticate, RoleMiddleware
├── bootstrap/app.php              ← Already L12/L13 style (no Kernel.php - GOOD)
└── routes/api.php                 ← API routes
```

### 2.2 What's Missing (L13 Rules Compliance)

| L13 Rule | Status | Priority |
|----------|--------|----------|
| G-01: No business logic in Controllers | ❌ VIOLATION | **HIGH** |
| G-08: Form Requests for validation | ❌ MISSING | **HIGH** |
| G-07: PHP 8.1+ Enums for fixed states | ❌ MISSING | **HIGH** |
| RULE ACT-01: Actions with handle() | ❌ MISSING | **HIGH** |
| RULE DTO-01: DTOs (readonly) | ❌ MISSING | **HIGH** |
| RULE REPO-01: Repositories + Interfaces | ❌ MISSING | **HIGH** |
| RULE EVT-01: Events + Listeners | ❌ MISSING | **MEDIUM** |
| RULE OBS-01: Observers | ❌ MISSING | **MEDIUM** |
| RULE CFG-01: Typed config | ❌ MISSING | **LOW** |
| RULE ATTR-01: PHP Attributes | ❌ MISSING | **LOW** |

### 2.3 Controllers Requiring Refactoring

#### Flat Controllers (app/Http/Controllers/Api/)
| Controller | Business Logic Present | Priority |
|------------|------------------------|----------|
| BookingController.php | ✅ Heavy (validation + logic) | **1** |
| PaymentController.php | ✅ Heavy (Stripe logic) | **1** |
| PropertyController.php | ✅ Moderate | **2** |
| RoomController.php | ✅ Moderate | **2** |
| GuestController.php | ✅ Moderate | **2** |
| AuthController.php | ✅ Moderate (JWT logic) | **1** |
| ReportController.php | ✅ Moderate | **3** |
| InvoiceController.php | ⚠️ Minimal | **3** |
| PaymentWebhookController.php | ⚠️ Minimal | **3** |
| StaffController.php | ⚠️ Minimal | **3** |

#### Module Controllers (app/Modules/*/Controllers/)
| Module | Status | Priority |
|--------|--------|----------|
| Bookings | ✅ Uses BookingService (GOOD) - needs Repository + Actions | **2** |
| Properties | ✅ Uses PropertyService (GOOD) - needs Repository + Actions | **2** |
| Staff | ✅ Uses StaffService (GOOD) - needs Repository + Actions | **2** |
| Admin | ⚠️ Uses AdminManagementService - needs Form Requests | **2** |
| Payments | ⚠️ Needs refactoring | **2** |
| Notifications | ⚠️ Direct email/SMS - needs Events | **3** |

---

## 3. Implementation Phases

### Phase 1: Foundation & Preparation (Day 1 Morning)
**Goal:** Create all supporting classes and interfaces without changing controller logic yet.

| Task ID | Task Name | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 1.1 | Create Enum classes for all fixed-state fields | 2h | HIGH |
| 1.2 | Create Form Request classes for all controllers | 3h | HIGH |
| 1.3 | Create Contracts/Interfaces for Repositories | 1h | HIGH |
| 1.4 | Create Repository classes (Eloquent implementation) | 3h | HIGH |
| 1.5 | Create DTO classes (readonly) | 2h | HIGH |
| 1.6 | Create Action classes (handle() only) | 3h | HIGH |
| 1.7 | Create ValueObject classes where needed | 1h | MEDIUM |

### Phase 2: Laravel 13 Upgrade (Day 1 Afternoon)
**Goal:** Upgrade framework and verify compatibility.

| Task ID | Task Name | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 2.1 | Update composer.json to require laravel/framework:^13.0 | 15m | HIGH |
| 2.2 | Run composer update and fix compatibility issues | 1h | HIGH |
| 2.3 | Update CSRF references (VerifyCsrfToken → PreventRequestForgery) | 30min | HIGH |
| 2.4 | Review middleware for L13 compatibility | 30min | MEDIUM |
| 2.5 | Run full test suite to verify upgrade | 1h | HIGH |

### Phase 3: Refactor Flat Controllers (Day 2)
**Goal:** Refactor all flat controllers to use new patterns.

| Task ID | Task Name | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 3.1 | Refactor AuthController → FormRequest + Action + DTO | 2h | HIGH |
| 3.2 | Refactor BookingController → Action + DTO + Repository | 3h | HIGH |
| 3.3 | Refactor PaymentController → Action + DTO + Service | 2h | HIGH |
| 3.4 | Refactor PropertyController → Repository + FormRequest | 2h | HIGH |
| 3.5 | Refactor RoomController → Repository + FormRequest | 2h | HIGH |
| 3.6 | Refactor GuestController → Action + DTO + Repository | 2h | HIGH |
| 3.7 | Refactor ReportController → CQRS (Query Handler) | 2h | MEDIUM |
| 3.8 | Refactor InvoiceController → Action | 1h | MEDIUM |
| 3.9 | Refactor PaymentWebhookController → Job + Action | 1h | MEDIUM |
| 3.10 | Refactor StaffController → Action + DTO | 1h | MEDIUM |

### Phase 4: Refactor Module Controllers (Day 3 Morning)
**Goal:** Refactor module controllers to use full pattern stack.

| Task ID | Task Name | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 4.1 | Refactor Admin module → FormRequest + Action | 2h | HIGH |
| 4.2 | Refactor Bookings module → Repository + Action | 2h | HIGH |
| 4.3 | Refactor Properties module → Repository + Action | 2h | HIGH |
| 4.4 | Refactor Staff module → Repository + Action | 2h | HIGH |
| 4.5 | Refactor Payments module → DTO + Action + FormRequest | 2h | HIGH |
| 4.6 | Refactor Notifications module → Event + Listener | 2h | MEDIUM |

### Phase 5: Implement Advanced Patterns (Day 3 Afternoon)
**Goal:** Add Event system, Observers, Pipeline.

| Task ID | Task Name | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 5.1 | Create Event classes (BookingCreated, PaymentProcessed, etc.) | 2h | MEDIUM |
| 5.2 | Create Listener classes (email notifications, audit logs) | 3h | MEDIUM |
| 5.3 | Create Observer classes (UserObserver, BookingObserver) | 2h | MEDIUM |
| 5.4 | Implement Pipeline for checkout/booking flow | 2h | LOW |
| 5.5 | Implement CQRS for reporting (if needed) | 2h | LOW |

### Phase 6: Typed Configuration & Caching (Day 4 Morning)
**Goal:** Update config access and improve caching.

| Task ID | Task Name | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 6.1 | Update all config() calls to use typed retrieval | 2h | LOW |
| 6.2 | Implement Cache::tags() for grouped invalidation | 1h | LOW |
| 6.3 | Implement Cache::touch() for active items | 1h | LOW |
| 6.4 | Add Cache::lock() for thundering herd prevention | 1h | LOW |

### Phase 7: Attribute-Based Configuration (Day 4 Afternoon)
**Goal:** Add L13 PHP attributes where beneficial.

| Task ID | Task Name | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 7.1 | Add #[Middleware] attributes to controllers | 1h | LOW |
| 7.2 | Add #[Authorize] attributes to controller methods | 1h | LOW |
| 7.3 | Add #[Tries], #[Backoff] attributes to Jobs | 30min | LOW |
| 7.4 | Add #[Table], #[FillableColumns] to Models | 1h | LOW |

### Phase 8: Testing Updates (Day 5)
**Goal:** Ensure all tests pass with new patterns.

| Task ID | Task Name | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 8.1 | Update existing tests for new patterns | 3h | HIGH |
| 8.2 | Add architecture tests (Pest arch()) | 2h | MEDIUM |
| 8.3 | Add unit tests for Actions, DTOs, Repositories | 3h | HIGH |
| 8.4 | Add feature tests with Form Request testing | 2h | HIGH |

### Phase 9: New L13 Features (Optional/Future)
**Goal:** Implement new L13 features if needed.

| Task ID | Task Name | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 9.1 | JSON:API Resources (if API spec compliance needed) | 4h | OPTIONAL |
| 9.2 | Semantic/Vector Search (if search feature needed) | 4h | OPTIONAL |
| 9.3 | Laravel AI SDK (if AI features needed) | 4h | OPTIONAL |
| 9.4 | Passkeys Authentication (if passwordless needed) | 3h | OPTIONAL |

---

## 4. Phase Details

### 4.1 Phase 1: Foundation & Preparation (Detailed Tasks)

#### Task 1.1: Create Enum Classes
**Files to Create:**
```
app/Enums/
├── BookingStatus.php          (pending, confirmed, checked_in, completed, cancelled)
├── PaymentStatus.php         (pending, completed, failed, refunded)
├── PaymentMethod.php         (card, cash, wallet, bank_transfer)
├── RoomStatus.php            (available, occupied, maintenance, cleaning)
├── PropertyStatus.php        (active, inactive, maintenance)
├── StaffRole.php             (superadmin, regional_admin, property_admin, manager, admin, reception, staff)
├── GuestStatus.php           (active, suspended, banned)
├── LoyaltyTier.php           (bronze, silver, gold, platinum)
└── BookingSource.php         (website, mobile_app, walk_in, phone, referral)
```

**Example Enum:**
```php
<?php
namespace App\Enums;

enum BookingStatus: string
{
    case PENDING    = 'pending';
    case CONFIRMED  = 'confirmed';
    case CHECKED_IN = 'checked_in';
    case COMPLETED  = 'completed';
    case CANCELLED  = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING    => 'Pending',
            self::CONFIRMED  => 'Confirmed',
            self::CHECKED_IN => 'Checked In',
            self::COMPLETED  => 'Completed',
            self::CANCELLED  => 'Cancelled',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::COMPLETED, self::CANCELLED]);
    }
}
```

#### Task 1.2: Create Form Request Classes
**Files to Create:**
```
app/Http/Requests/
├── Api/
│   ├── Auth/
│   │   ├── LoginRequest.php
│   │   ├── RegisterRequest.php
│   │   └── ForgotPasswordRequest.php
│   ├── Booking/
│   │   ├── CreateBookingRequest.php
│   │   ├── UpdateBookingRequest.php
│   │   └── CheckInRequest.php
│   ├── Payment/
│   │   ├── CreatePaymentRequest.php
│   │   └── RefundPaymentRequest.php
│   ├── Property/
│   │   ├── CreatePropertyRequest.php
│   │   └── UpdatePropertyRequest.php
│   ├── Room/
│   │   ├── CreateRoomRequest.php
│   │   └── UpdateRoomRequest.php
│   └── Guest/
│       ├── UpdateProfileRequest.php
│       └── ChangePasswordRequest.php
└── Modules/
    ├── Admin/
    ├── Bookings/
    ├── Properties/
    ├── Staff/
    └── Payments/
```

**Example Form Request:**
```php
<?php
namespace App\Http\Requests\Api\Booking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\BookingSource;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // JWT middleware handles auth
    }

    public function rules(): array
    {
        return [
            'property_id'    => ['required', 'uuid', 'exists:properties,id'],
            'room_type_id'   => ['required', 'uuid', 'exists:room_types,id'],
            'check_in_date'  => ['required', 'date', 'after_or_equal:today'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'guest_count'    => ['required', 'integer', 'min:1', 'max:10'],
            'special_requests' => ['nullable', 'string', 'max:500'],
            'source'         => ['nullable', Rule::enum(BookingSource::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'check_in_date.after_or_equal' => 'Check-in date must be today or later.',
            'check_out_date.after' => 'Check-out date must be after check-in date.',
        ];
    }
}
```

#### Task 1.3: Create Contracts/Interfaces
**Files to Create:**
```
app/Contracts/
├── Repositories/
│   ├── BookingRepositoryInterface.php
│   ├── PropertyRepositoryInterface.php
│   ├── RoomRepositoryInterface.php
│   ├── GuestRepositoryInterface.php
│   ├── PaymentRepositoryInterface.php
│   └── StaffRepositoryInterface.php
├── Services/
│   ├── PaymentGatewayInterface.php
│   └── NotificationServiceInterface.php
└── Actions/
    └── ActionInterface.php
```

**Example Interface:**
```php
<?php
namespace App\Contracts\Repositories;

use App\Models\Booking;
use App\DTO\CreateBookingDTO;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BookingRepositoryInterface
{
    public function find(string $id): ?Booking;
    public function findOrFail(string $id): Booking;
    public function create(CreateBookingDTO $dto): Booking;
    public function update(Booking $booking, array $data): Booking;
    public function delete(Booking $booking): bool;
    public function getPaginated(array $filters, int $perPage = 15): LengthAwarePaginator;
    public function findByGuest(string $guestId, array $filters = []): LengthAwarePaginator;
    public function checkAvailability(string $roomTypeId, string $checkIn, string $checkOut): bool;
}
```

#### Task 1.4: Create Repository Classes
**Files to Create:**
```
app/Repositories/
├── EloquentBookingRepository.php
├── EloquentPropertyRepository.php
├── EloquentRoomRepository.php
├── EloquentGuestRepository.php
├── EloquentPaymentRepository.php
└── EloquentStaffRepository.php
```

**ServiceProvider Binding:**
```php
// app/Providers/RepositoryServiceProvider.php
public function register(): void
{
    $this->app->bind(BookingRepositoryInterface::class, EloquentBookingRepository::class);
    $this->app->bind(PropertyRepositoryInterface::class, EloquentPropertyRepository::class);
    // ... etc
}
```

#### Task 1.5: Create DTO Classes
**Files to Create:**
```
app/DTO/
├── CreateBookingDTO.php
├── UpdateBookingDTO.php
├── CreatePropertyDTO.php
├── UpdatePropertyDTO.php
├── CreatePaymentDTO.php
├── CreateGuestDTO.php
└── CheckoutContext.php
```

**Example DTO:**
```php
<?php
namespace App\DTO;

use App\Enums\BookingSource;
use App\Enums\PaymentMethod;

readonly class CreateBookingDTO
{
    public function __construct(
        public string        $propertyId,
        public string        $roomTypeId,
        public string        $guestId,
        public \DateTime     $checkInDate,
        public \DateTime     $checkOutDate,
        public int           $guestCount,
        public PaymentMethod $paymentMethod,
        public ?BookingSource $source = null,
        public ?string       $specialRequests = null,
        public array         $extras = [],
    ) {}

    public static function fromRequest(CreateBookingRequest $request): self
    {
        return new self(
            propertyId: $request->validated('property_id'),
            roomTypeId: $request->validated('room_type_id'),
            guestId: $request->user()->id, // From JWT
            checkInDate: new \DateTime($request->validated('check_in_date')),
            checkOutDate: new \DateTime($request->validated('check_out_date')),
            guestCount: $request->validated('guest_count'),
            paymentMethod: PaymentMethod::from($request->validated('payment_method')),
            source: $request->validated('source') ? BookingSource::from($request->validated('source')) : null,
            specialRequests: $request->validated('special_requests'),
            extras: $request->validated('extras', []),
        );
    }
}
```

#### Task 1.6: Create Action Classes
**Files to Create:**
```
app/Actions/
├── Bookings/
│   ├── CreateBooking.php
│   ├── UpdateBooking.php
│   ├── CancelBooking.php
│   └── CheckInBooking.php
├── Payments/
│   ├── ProcessPayment.php
│   └── RefundPayment.php
├── Properties/
│   ├── CreateProperty.php
│   └── UpdateProperty.php
└── Guests/
    ├── RegisterGuest.php
    └── UpdateProfile.php
```

**Example Action:**
```php
<?php
namespace App\Actions\Bookings;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\DTO\CreateBookingDTO;
use App\Events\BookingCreated;
use App\Models\Booking;

readonly class CreateBooking
{
    public function __construct(
        private BookingRepositoryInterface $bookings,
        private PropertyRepositoryInterface $properties,
    ) {}

    public function handle(CreateBookingDTO $dto): Booking
    {
        // Business validation
        if (!$this->properties->isAvailable($dto->propertyId, $dto->checkInDate, $dto->checkOutDate)) {
            throw new \App\Exceptions\RoomNotAvailableException();
        }

        $booking = DB::transaction(function () use ($dto) {
            $booking = $this->bookings->create($dto);
            // Reserve room, calculate total, etc.
            return $booking;
        });

        // Dispatch event AFTER commit
        BookingCreated::dispatch($booking);

        return $booking;
    }
}
```

#### Task 1.7: Create ValueObject Classes
**Files to Create:**
```
app/ValueObjects/
├── Money.php
├── Address.php
└── DateRange.php
```

---

### 4.2 Phase 2: Laravel 13 Upgrade (Detailed Tasks)

#### Task 2.1: Update composer.json
```json
{
    "require": {
        "php": "^8.3",
        "laravel/framework": "^13.0"
    }
}
```

#### Task 2.3: CSRF Middleware Update
Check for any references to `VerifyCsrfToken` and replace with `PreventRequestForgery`.

---

### 4.3 Phase 3: Refactor Flat Controllers (Example)

#### Task 3.2: Refactor BookingController (BEFORE/AFTER)

**BEFORE (Current):**
```php
class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            // ... more validation
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Business logic directly in controller - VIOLATION!
        $booking = Booking::create([...]);
        // ... more logic

        return response()->json($booking, 201);
    }
}
```

**AFTER (Target):**
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Booking\CreateBookingRequest;
use App\Actions\Bookings\CreateBooking;
use App\Http\Resources\BookingResource;

class BookingController extends Controller
{
    #[Middleware('auth.jwt')]
    #[Authorize('create', 'booking')]
    public function store(CreateBookingRequest $request, CreateBooking $action): \Illuminate\Http\JsonResponse
    {
        $booking = $action->handle(CreateBookingDTO::fromRequest($request));
        return response()->json(new BookingResource($booking), 201);
    }
}
```

---

## 5. Task Dependency Graph

```
Phase 1 (Foundation)
    ├── Task 1.1 (Enums) ──────────────────────┐
    ├── Task 1.2 (Form Requests) ───────────────┤
    ├── Task 1.3 (Interfaces) ─────────────────┤
    │   └── Task 1.4 (Repositories) ───────────┤
    │       └── Task 1.6 (Actions) ────────────┤
    ├── Task 1.5 (DTOs) ───────────────────────┤
    │   └── Task 1.6 (Actions) ────────────────┤
    └── Task 1.7 (ValueObjects) ───────────────┘
                                               │
Phase 2 (L13 Upgrade) ◄─────────────────────────┘
    │
    ├── Task 2.1-2.5 (All depend on Phase 1 completion)
    │
Phase 3 (Refactor Flat Controllers) ◄──────────┘
    │
    ├── Task 3.1-3.10 (All depend on Phase 1 + 2)
    │
Phase 4 (Refactor Module Controllers) ◄─────────┘
    │
    ├── Task 4.1-4.6 (All depend on Phase 3)
    │
Phase 5 (Advanced Patterns) ◄────────────────────┘
    │
    ├── Task 5.1-5.5 (All depend on Phase 4)
    │
Phase 6 (Typed Config & Caching) ◄──────────────┘
    │
Phase 7 (Attribute-Based Config) ◄───────────────┘
    │
Phase 8 (Testing Updates) ◄──────────────────────┘
    │
Phase 9 (New L13 Features) ◄─────────────────────┘
```

---

## 6. File Structure Target

### Target Structure (After Refactoring)
```
backend/app/
├── Actions/                          # NEW (RULE ACT-01)
│   ├── Bookings/
│   │   ├── CreateBooking.php
│   │   ├── UpdateBooking.php
│   │   ├── CancelBooking.php
│   │   └── CheckInBooking.php
│   ├── Payments/
│   │   ├── ProcessPayment.php
│   │   └── RefundPayment.php
│   ├── Properties/
│   └── Guests/
├── Ai/                               # NEW (L13 Feature)
│   └── Agents/
├── Contracts/                        # NEW (RULE G-10)
│   ├── Repositories/
│   │   ├── BookingRepositoryInterface.php
│   │   └── ...
│   └── Services/
├── DTO/                              # NEW (RULE DTO-01)
│   ├── CreateBookingDTO.php
│   ├── UpdateBookingDTO.php
│   └── ...
├── Enums/                            # NEW (RULE G-07)
│   ├── BookingStatus.php
│   ├── PaymentStatus.php
│   └── ...
├── Events/                           # NEW (RULE EVT-01)
│   ├── BookingCreated.php
│   ├── PaymentProcessed.php
│   └── ...
├── Http/
│   ├── Controllers/
│   │   ├── Api/                      # THIN (RULE G-01)
│   │   │   ├── BookingController.php
│   │   │   └── ...
│   │   └── ...
│   ├── Middleware/                   # Keep existing
│   │   ├── JwtAuthenticate.php
│   │   └── RoleMiddleware.php
│   ├── Requests/                     # NEW (RULE G-08)
│   │   ├── Api/
│   │   │   ├── Booking/
│   │   │   ├── Payment/
│   │   │   └── ...
│   │   └── Modules/
│   └── Resources/                    # Keep/Expand
│       └── ...
├── Jobs/                             # NEW (RULE JOB-01)
│   ├── ProcessPaymentJob.php
│   └── SendBookingConfirmationJob.php
├── Listeners/                        # NEW (RULE EVT-04)
│   ├── SendBookingConfirmation.php
│   └── UpdateInventory.php
├── Models/                           # Keep (RULE G-02)
│   ├── Booking.php
│   └── ...
├── Observers/                        # NEW (RULE OBS-01)
│   ├── BookingObserver.php
│   └── UserObserver.php
├── Pipelines/                        # NEW (RULE PIPE-01)
│   └── Checkout/
│       ├── ApplyCoupon.php
│       ├── CalculateTax.php
│       └── ...
├── Policies/                         # NEW (RULE AUTH-01)
│   ├── BookingPolicy.php
│   └── PropertyPolicy.php
├── Providers/                        # Keep/Add
│   ├── RepositoryServiceProvider.php  # NEW
│   └── ...
├── Repositories/                     # NEW (RULE REPO-01)
│   ├── EloquentBookingRepository.php
│   └── ...
├── Services/                         # Keep/Refactor
│   ├── JwtService.php
│   ├── EmailService.php
│   └── ...
└── ValueObjects/                     # NEW (RULE CAST-01)
    ├── Money.php
    └── Address.php
```

---

## 7. Success Metrics

### Code Quality Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Controllers with business logic | 0 | Grep for DB/Model calls in controllers |
| Form Request usage | 100% | All validation in Form Requests |
| DTO usage | 100% | Data passed via DTOs, not raw arrays |
| Repository pattern | 100% | All Eloquent in Repositories |
| Action pattern | 100% | All business logic in Actions |
| Enum usage | 100% | All fixed states use Enums |
| Pint compliance | 100% | `./vendor/bin/pint --test` passes |
| PHPStan/Type coverage | Level 8 | Static analysis passes |

### Testing Metrics
| Metric | Target |
|--------|--------|
| Unit test coverage | >80% |
| Feature test coverage | >80% |
| Architecture tests | All rules enforced |
| CI pipeline | All checks pass |

### Performance Metrics
| Metric | Target |
|--------|--------|
| N+1 queries | 0 (eager loading everywhere) |
| DB queries per page | <50 |
| Cache hit rate | >80% |
| Response time (p95) | <200ms |

---

## 8. Implementation Notes

### Safety Measures
1. **Branch Strategy:** Create feature branch `feature/laravel13-refactor` from `develop`
2. **Incremental:** Complete each phase fully before moving to next
3. **Tests:** Run tests after each task
4. **CI:** Push to remote to trigger CI early and often
5. **Rollback:** Keep `composer.lock` backed up for quick revert

### Pint/Code Style
- Run `./vendor/bin/pint` after every task
- Run `./vendor/bin/pint --test` before committing

### Commit Convention
```
TASK-XXX: Description

Examples:
TASK-001: Create Enum classes for fixed-state fields
TASK-002: Create Form Request classes for all controllers
TASK-003: Refactor BookingController to use Action pattern
```

---

## 9. Getting Started

### Prerequisites
```bash
cd backend
php --version  # Must be 8.3+
composer --version
```

### First Steps
1. Create feature branch: `git checkout -b feature/laravel13-refactor`
2. Start with Task 1.1 (Create Enums)
3. Commit after each task: `git commit -m "TASK-001: Create Enum classes"`
4. Push frequently: `git push -u origin feature/laravel13-refactor`

---

**End of Implementation Plan**

*Next Step: User approves plan → Begin Task 1.1*
