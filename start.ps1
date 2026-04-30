# AO Project - Dev Start Script
# Run from the project root: .\start.ps1

$ROOT    = $PSScriptRoot
$BACKEND = "$ROOT\backend"
$ADMIN   = "$ROOT\frontend\admin"
$MOBILE  = "$ROOT\frontend\mobile"
$HERD    = "$env:USERPROFILE\.config\herd"
$SITES   = "$HERD\config\valet\Sites"

function Banner($text) { Write-Host "`n$text" -ForegroundColor Cyan }
function Ok($text)     { Write-Host "  OK  $text" -ForegroundColor Green }
function Info($text)   { Write-Host "  ..  $text" -ForegroundColor Gray }
function Warn($text)   { Write-Host "  !!  $text" -ForegroundColor Yellow }

Banner "=== AO Hostel - Starting Dev Environment ==="

# -- 1. BACKEND ----------------------------------------------------------------
Banner "[1/3] Backend (Laravel 13 -> http://ao-api.test)"

# Link with Herd if not already done
if (-not (Test-Path "$SITES\ao-api")) {
    Info "Linking ao-api.test in Herd..."
    Push-Location $BACKEND
    & "$HERD\bin\herd.bat" link ao-api
    Pop-Location
    Ok "ao-api.test linked"
} else {
    Ok "ao-api.test already linked"
}

Push-Location $BACKEND

# Storage symlink (safe to re-run)
Info "Storage link..."
php artisan storage:link 2>&1 | Out-Null

# Run any pending migrations
Info "Running migrations..."
$migrateOut = php artisan migrate --no-interaction 2>&1
if ($LASTEXITCODE -eq 0) { Ok "Migrations up to date" }
else { Warn "Migration issue - check manually"; Write-Host $migrateOut }

# Clear caches
php artisan config:clear 2>&1 | Out-Null
php artisan cache:clear  2>&1 | Out-Null

Pop-Location
Ok "Backend ready at http://ao-api.test"
Ok "API health check: http://ao-api.test/up"

# -- 2. ADMIN FRONTEND ---------------------------------------------------------
Banner "[2/3] Admin Panel (Next.js -> http://localhost:3000)"

Push-Location $ADMIN
if (-not (Test-Path "node_modules")) {
    Info "Installing npm packages (first run, this may take a minute)..."
    npm install --silent
    if ($LASTEXITCODE -ne 0) { Warn "npm install failed - check the output above" }
}
Pop-Location

Info "Opening Admin dev server in new window..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'Admin Panel - http://localhost:3000' -ForegroundColor Cyan; Set-Location '$ADMIN'; npm run dev"
)
Ok "Admin window launched -> http://localhost:3000"

# -- 3. MOBILE -----------------------------------------------------------------
Banner "[3/3] Mobile App (Expo)"

Push-Location $MOBILE
if (-not (Test-Path "node_modules")) {
    Info "Installing npm packages (first run, this may take a minute)..."
    npm install --silent
    if ($LASTEXITCODE -ne 0) { Warn "npm install failed - check the output above" }
}
Pop-Location

Info "Opening Expo in new window..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'Mobile - Expo Dev Server' -ForegroundColor Cyan; Set-Location '$MOBILE'; npx expo start"
)
Ok "Expo window launched"

# -- SUMMARY -------------------------------------------------------------------
Banner "=== All services started ==="
Write-Host ""
Write-Host "  Backend API   http://ao-api.test        (served by Herd/Nginx)"
Write-Host "  Admin Panel   http://localhost:3000     (Next.js dev server)"
Write-Host "  Mobile        Expo window               (scan QR with Expo Go)"
Write-Host ""
Write-Host "  Tip: add real Stripe keys to backend\.env when testing payments"
Write-Host ""
