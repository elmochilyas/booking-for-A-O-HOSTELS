# AGENTS.md

## Repo Structure

- `backend/` — Laravel 12 API (PHP 8.2+, served at `http://ao-api.test`)
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
```
Tests use SQLite in-memory (configured in `phpunit.xml`).

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
- **Flat controllers** in `app/Http/Controllers/Api/` — Auth, Booking, Payment, etc.
- **Modules** in `app/Modules/<Name>/` — Controllers/Services subdirs (Auth, Bookings, Properties, Staff, Payments, Notifications)

Prefer `app/Modules/` for new bounded contexts.

### Middleware
- `JwtAuthenticate` / `app/Modules/Auth/Middleware/JwtMiddleware.php`
- `RoleMiddleware` / `app/Modules/Auth/Middleware/RoleMiddleware.php`

### API Prefix
All routes under `/api/`. Guest frontend env (`frontend/guest/.env.local`) pre-configured with `NEXT_PUBLIC_API_URL=http://ao-api.test/api`. Never hardcode.

### Mobile Access
Mobile app connects to `http://<machine-ip>:8000` — backend also runs on port 8000 (in addition to Herd's ao-api.test) for device/simulator access.

## Critical: CI & Composer

### CI Workflow
- `.github/workflows/ci.yml` — runs on PRs to `main` and `develop`
- Runs: PHP CS Fixer (pint --test), PHPUnit with coverage, ESLint + TypeScript on all 3 frontends

**Important**: Frontend lint/typecheck use `|| true` — failures won't fail the CI build.

### Composer Lock File Issues
If CI fails with "locked to version X but does not satisfy your PHP version":
1. Check `backend/composer.json` has correct Laravel version (Laravel 12 needs PHP 8.2, Laravel 13 needs PHP 8.3+)
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
