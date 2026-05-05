# AO Hostels Booking Platform

Full-stack hostel booking platform: **Laravel 12 (PHP 8.3)** API backend + **Next.js 15 (TypeScript)** guest frontend + React Native mobile app.

## Stack

| Layer | Tech |
|---|---|
| Backend API | Laravel 12, PHP 8.3, MySQL, Redis (Predis), Stripe, SendGrid, Twilio |
| Guest Frontend | Next.js 15 App Router, TypeScript, Tailwind CSS, Radix UI, TanStack Query, Zod |
| Mobile | Expo / React Native |
| Auth | Spatie Laravel Permission, JWT |
| Dev tools | Laravel Pint (PHP formatting), PHPUnit 11, Pest |

## Key Paths

- `backend/` — Laravel API (`php artisan`, routes in `routes/`, models in `app/Models/`)
- `frontend/guest/` — Next.js guest app (port 3001)
- `frontend/admin/` — Next.js admin app
- `frontend/mobile/` — Expo mobile app
- `backend/run_tests.php` — custom test runner script

## Local Dev URLs

- API: `http://ao-api.test` (Laravel Herd) or `http://localhost:8000`
- Guest frontend: `http://localhost:3001`

## Commands

```bash
# Backend
php artisan serve
php artisan migrate --seed
./vendor/bin/pint                  # format PHP
./vendor/bin/phpunit               # run tests

# Guest Frontend
cd frontend/guest
npm run dev        # starts on port 3001
npm run typecheck  # tsc --noEmit
npm run lint
npm run build
```

## Coding Standards

### Universal
- **KISS / DRY / YAGNI** — simplest solution that works; extract repeated logic; don't build ahead of need
- File size: aim 200–400 lines, 800 max; organize by feature/domain
- **Immutability** — never mutate objects; use spread/readonly
- Naming: `camelCase` vars/functions, `PascalCase` types/components, `UPPER_SNAKE_CASE` constants
- No deep nesting — prefer early returns
- No magic numbers — use named constants
- **No `console.log` in production code**
- Validate at system boundaries only (user input, external APIs)
- Never hardcode secrets — always use environment variables

### PHP / Laravel
- `declare(strict_types=1)` in all PHP files
- PSR-12 style enforced via Laravel Pint
- PHPStan for static analysis (`phpstan.neon`)
- Use scalar type hints, return types, typed properties everywhere
- Prefer immutable DTOs / value objects for cross-service data
- Throw exceptions for errors; never return `false`/`null` as hidden error channels
- Always use Eloquent query builder or prepared statements — no string-concatenated SQL
- Mass-assignment: whitelist `$fillable` explicitly
- Use FormRequest classes for input validation
- Regenerate session ID after auth and privilege escalation

### TypeScript / Next.js
- Strict TypeScript — no `any`; use `unknown` for external input then narrow
- Use `interface` for extensible object shapes, `type` for unions/intersections
- Prefer string literal unions over `enum`
- Zod for schema validation at API boundaries — infer types from schema
- Define component props with named interfaces; avoid `React.FC`
- Use spread `{ ...obj, key }` never direct mutation
- Async/await + try-catch; narrow `unknown` errors with `instanceof Error`
- Remove all `console.log` before committing

## Security Checklist (pre-commit)

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated (FormRequest / Zod)
- [ ] SQL injection prevention (parameterized queries / Eloquent)
- [ ] XSS prevention (sanitized HTML output)
- [ ] CSRF protection enabled on state-changing requests
- [ ] Authentication/authorization verified on every route
- [ ] Rate limiting on public API endpoints
- [ ] Error messages don't leak sensitive data

## Git Workflow

Commit types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

Format: `<type>: <description>`

PRs: review full commit history with `git diff main...HEAD`, write detailed description + test plan.

## Testing

- 80% minimum coverage (unit + integration + E2E)
- TDD: RED → GREEN → REFACTOR
- Unit tests: individual functions in isolation
- Integration: API endpoints + database
- E2E: critical user flows (booking, payment, auth)
- Use factories/builders for fixtures, never large hand-written arrays
- Never mock the database in integration tests
- PHPUnit / Pest for backend; keep controller tests for transport/validation, business logic in service-layer tests

## Available Agents

Use these specialized agents by mentioning them or via `/agent <name>`:

| Agent | Purpose |
|---|---|
| `security-reviewer` | OWASP Top 10, secrets scan, auth checks |
| `typescript-reviewer` | Type safety, async correctness, Next.js patterns |
| `tdd-guide` | Enforces RED→GREEN→REFACTOR, 80% coverage |
| `build-error-resolver` | Fix TypeScript/PHP build errors minimally |
| `code-reviewer` | Full code review with severity-ranked findings |
| `performance-optimizer` | Bundle size, N+1 queries, React rendering |
| `planner` | Implementation plans for complex features |
| `database-reviewer` | Query optimization, schema design, N+1 prevention |
