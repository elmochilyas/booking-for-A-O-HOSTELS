# AGENTS.md

## Repo Structure

- `backend/` — Laravel 13 API (PHP 8.2+, served at `http://ao-api.test`)
- `frontend/admin/` — Next.js 14 admin panel (port 3000)
- `frontend/guest/` — Next.js 14 guest website (port 3001)
- `frontend/mobile/` — Expo/React Native mobile app
- `docs/` — Project spec documents (not code references)

## Developer Commands

### Backend
```bash
cd backend
php artisan storage:link        # Required on first run
php artisan migrate             # Run pending migrations
php artisan config:clear
php artisan cache:clear
./vendor/bin/pint               # Format (use --test to check only)
./vendor/bin/phpunit           # Run all tests
./vendor/bin/phpunit --filter Unit        # Unit tests only
./vendor/bin/phpunit --testsuite Feature  # Feature tests only
```
Tests use SQLite in-memory (configured in `phpunit.xml`).

### Frontend (each dir)
```bash
npm run dev          # Dev server
npm run build       # Production build
npm run lint        # ESLint
npm run typecheck   # TypeScript check
```

## Architecture Notes

### Backend — Modular Structure
The backend uses two patterns side-by-side:
- **Flat controllers** in `app/Http/Controllers/Api/` — used by Auth, Booking, Payment, etc.
- **Modules** in `app/Modules/<Name>/` — organized as Controllers/Services subdirs (Auth, Bookings, Properties, Staff, Payments, Notifications)

When adding features, prefer the `app/Modules/` structure for new bounded contexts.

### Middleware
- `JwtAuthenticate` / `app/Modules/Auth/Middleware/JwtMiddleware.php` — validates JWT tokens
- `RoleMiddleware` / `app/Modules/Auth/Middleware/RoleMiddleware.php` — enforces roles

### API Prefix
All API routes are under `/api/`. The guest frontend env (`frontend/guest/.env.local`) is pre-configured with `NEXT_PUBLIC_API_URL=http://ao-api.test/api`. Never hardcode this URL.

## Env / Secrets
- Guest frontend: `frontend/guest/.env.local` — has placeholder Stripe key and Google Maps key. Replace before testing payments/maps.
- Backend `.env` is gitignored. Provide your own or copy `.env.example`.

## CI Pipeline (`.github/workflows/ci.yml`)
Runs on every push/PR to `main` and `develop`:
1. Backend: `pint --test` (lint) → `phpunit --coverage`
2. Frontend: `npm run lint` and `npm run typecheck` for both `mobile` and `admin`

The lint/typecheck steps use `|| true` — failures are reported but don't block CI. Fix them.

## Branch Strategy (`BRANCHING_STRATEGY.md`)
- `main` — production (never push direct)
- `develop` — integration
- Features: `feature/TASK-XXX-description`
- Fixes: `fix/TASK-XXX-description`
- Commits: conventional format `TASK-XXX: Description`

## Testing Tips
- PHP tests: uses `fakerphp/faker` and `laravel/sail` for factories and test helpers.
- Mobile/admin tests not yet configured in CI — only lint/typecheck run.