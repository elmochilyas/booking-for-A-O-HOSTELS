# AGENTS.md

## Repo Structure

- `backend/` — Laravel 13 API (PHP 8.3+, served at `http://ao-api.test`)
- `frontend/admin/` — Next.js 14 admin panel (port 3000)
- `frontend/guest/` — Next.js 14 guest website (port 3001)
- `frontend/mobile/` — Expo/React Native mobile app
- `docs/` — Project spec documents

## Developer Commands

### Backend
```bash
cd backend
php artisan storage:link        # Required on first run
php artisan migrate             # Run pending migrations
php artisan config:clear
php artisan cache:clear
./vendor/bin/pint               # Format (use --test to check only)
./vendor/bin/phpunit            # Run all tests
./vendor/bin/phpunit --filter Unit        # Unit tests only
./vendor/bin/phpunit --testsuite Feature  # Feature tests only
./vendor/bin/pest              # Pest tests (arch tests)
```

**Test DB:** SQLite in-memory (`:memory:`) configured in `phpunit.xml`.
**Test file encoding:** Use ASCII encoding — UTF-8 adds BOM that breaks Pest/PHPUnit discovery.

### Frontend (each dir)
```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint        # ESLint
npm run typecheck   # TypeScript check
```

### Start Script (root)
```powershell
.\start.ps1             # Everything (backend + admin + guest + mobile)
.\start.ps1 admin      # Backend + admin panel only
.\start.ps1 guest      # Backend + guest website only
.\start.ps1 mobile     # Backend + Expo
.\start.ps1 frontend  # Backend + admin + guest
```

## Architecture Notes

### Backend — Modular Structure
Two patterns side-by-side:
- **Flat controllers** in `app/Http/Controllers/Api/` — Auth, Booking, Payment, Property, etc.
- **Modules** in `app/Modules/<Name>/` — Controllers/Services subdirs (Auth, Bookings, Properties, Staff, Payments, Notifications)

Prefer `app/Modules/` for new bounded contexts.

### Middleware
- `JwtAuthenticate` / `app/Modules/Auth/Middleware/JwtMiddleware.php`
- `RoleMiddleware` / `app/Modules/Auth/Middleware/RoleMiddleware.php`

### API Prefix
All routes under `/api/`. Guest frontend env (`frontend/guest/.env.local`) pre-configured with `NEXT_PUBLIC_API_URL=http://ao-api.test/api`. Never hardcode.

### Mobile Access
Mobile app connects to `http://<machine-ip>:8000` — backend also runs on port 8000 (in addition to Herd's ao-api.test) for device/simulator access.

## Laravel 13 Attribute-Based Config (NEW)

### Controllers — PHP Attributes
```php
#[Middleware('auth.jwt')]
#[Middleware('role:superadmin,property_admin')]
class BookingController extends Controller
{
    #[Middleware('auth.jwt')]
    #[Authorize('create', 'booking')]
    public function store(CreateBookingRequest $request, CreateBooking $action): JsonResponse
    {
        $booking = $action->handle(CreateBookingDTO::fromRequest($request));
        return response()->json(new BookingResource($booking), 201);
    }
}
```

### Models — Declarative Attributes
```php
#[Table('properties', key: 'property_id')]
#[FillableColumns(['name', 'location', 'address'])]
#[Hidden(['deleted_at'])]
#[ObservedBy([PropertyObserver::class])]
class Property extends Model
{
    protected $casts = [
        'status'       => PropertyStatus::class,
        'created_at' => 'datetime',
    ];
}
```

### Jobs — Queue Config via Attributes
```php
#[Tries(3)]
#[Backoff([10, 60, 300])]
#[Timeout(120)]
class ProcessPaymentJob implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(private readonly Payment $payment) {}
}
```

## Critical: CI & Composer

### CI Workflow
- `.github/workflows/ci.yml` — runs on PRs to `main` and `develop`
- Runs: PHP CS Fixer (pint --test), PHPUnit with coverage, ESLint + TypeScript on all 3 frontends

**Important**: Frontend lint/typecheck use `|| true` — failures won't fail the CI build.

### Composer Lock File Issues
If CI fails with "locked to version X but does not satisfy your PHP version":
1. Check `backend/composer.json` has correct Laravel version (Laravel 13 needs PHP 8.3+)
2. CI workflow deletes lock before update: `rm -f backend/composer.lock && composer update --prefer-lowest`

The lock file in git may not match CI environment. Always use `composer update` in CI, not `composer install`.

## Env / Secrets
- Guest frontend: `frontend/guest/.env.local` — placeholder Stripe/Google Maps keys. Replace before testing payments/maps.
- Backend `.env` is gitignored. Copy `.env.example`.

## Branch Strategy
- `main` — production (never push direct)
- `develop` — integration
- Features: `feature/TASK-XXX-description`
- Fixes: `fix/TASK-XXX-description`
- Commits: conventional format `TASK-XXX: Description`

## Phase 8: Testing Updates (Completed)

### Architecture Tests (Pest arch())
13 architecture tests pass enforcing L13 rules:
- Controllers must not use Models directly
- Actions must be readonly with handle() method
- DTOs must be readonly
- Repositories must implement interfaces
- Enums must be PHP Enums
- Form Requests must extend FormRequest

### Test Results
- **Architecture tests:** 13 passed
- **Feature tests:** 12 passed (AuthApiTest, BookingApiTest)
- **Unit tests:** BOM encoding issue resolved (use ASCII encoding)

## Phase 9: New L13 Features (Optional/Completed)

### JSON:API Resources (RULE JAPI-01 to JAPI-04)
Created 6 JsonApiResource classes:
- `GuestJsonApiResource.php`
- `BookingJsonApiResource.php`
- `PropertyJsonApiResource.php`
- `RoomJsonApiResource.php`
- `RoomTypeJsonApiResource.php`
- `AmenityJsonApiResource.php`

### Laravel AI SDK (RULE AI-01 to AI-08)
Created `config/ai.php` with provider failover (RULE AI-03).

### Passkeys Authentication (RULE PASS-01 to PASS-05)
Created `app/Auth/Passkeys/` with PasskeyOptions and VerifyPasskey.

### Semantic/Vector Search (RULE VEC-01 to VEC-07)
Skipped — requires PostgreSQL + pgvector extension. Not needed currently.

## OpenCode Specifics

### Tools Available
- `bash` — runs **Windows PowerShell 5.1** (NOT real bash)
- `write` — creates files with UTF-8 BOM (use ASCII encoding via `Set-Content -Encoding ASCII`)
- `read` — reads files correctly
- `edit` — requires exact string match (including whitespace)

### Common Pitfalls
1. **BOM in PHP files**: PowerShell's `Set-Content -Encoding UTF8` adds BOM (bytes 239,187,191).
   Fix: Use `Set-Content -Encoding ASCII` or `$content = Get-Content -Encoding UTF8` then `Set-Content -Encoding UTF8`.

2. **PHP opening tag**: Must be `<?php` (no `>`). The `>` in `<?php>` is PowerShell prompt, not file content.

3. **Test discovery**: Pest/PHPUnit won't discover files with BOM. Check with `Get-Content file -Encoding Byte -TotalCount 5`.

### Project-Specific Shortcuts
- API URL always `http://ao-api.test/api` for frontend
- Backend also listens on port 8000 for mobile access
- SQLite `:memory:` for tests, `tests.sqlite` file as alternative
- Pint config: `./vendor/bin/pint --test` to check only
