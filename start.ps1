# AO Project - Dev Start Script
#
# Usage:
#   .\start.ps1             -> everything  (backend + admin + guest + mobile)
#   .\start.ps1 admin       -> backend + admin panel  (localhost:3000)
#   .\start.ps1 guest       -> backend + guest website (localhost:3001)
#   .\start.ps1 mobile      -> backend + Expo
#   .\start.ps1 frontend    -> backend + admin + guest
#   .\start.ps1 admin guest -> backend + admin + guest  (same as frontend)
#
param(
    [Parameter(Position = 0, ValueFromRemainingArguments)]
    [string[]] $Part
)

$ROOT    = $PSScriptRoot
$BACKEND = "$ROOT\backend"
$ADMIN   = "$ROOT\frontend\admin"
$GUEST   = "$ROOT\frontend\guest"
$MOBILE  = "$ROOT\frontend\mobile"
$HERD    = "$env:USERPROFILE\.config\herd"
$SITES   = "$HERD\config\valet\Sites"

function Banner($text) { Write-Host "`n$text" -ForegroundColor Cyan }
function Ok($text)     { Write-Host "  OK  $text" -ForegroundColor Green }
function Info($text)   { Write-Host "  ..  $text" -ForegroundColor Gray }
function Warn($text)   { Write-Host "  !!  $text" -ForegroundColor Yellow }

# ── resolve which parts to run ────────────────────────────────────────────────
# Each named part always includes the backend.
# 'all' / no arg  -> backend + admin + guest + mobile
# 'admin'         -> backend + admin
# 'guest'         -> backend + guest
# 'mobile'        -> backend + mobile
# 'frontend'      -> backend + admin + guest

$valid = @('admin', 'guest', 'mobile', 'frontend')

if (-not $Part -or $Part.Count -eq 0) {
    $frontends = @('admin', 'guest', 'mobile')
} else {
    $frontends = @()
    foreach ($p in $Part) {
        switch ($p.ToLower()) {
            'frontend' { $frontends += 'admin', 'guest' }
            'admin'    { $frontends += 'admin'  }
            'guest'    { $frontends += 'guest'  }
            'mobile'   { $frontends += 'mobile' }
            default {
                Write-Host "Unknown part: '$p'" -ForegroundColor Red
                Write-Host "Valid values: admin, guest, mobile, frontend" -ForegroundColor Yellow
                exit 1
            }
        }
    }
    $frontends = $frontends | Select-Object -Unique
}

# backend always runs
$run = @('backend') + $frontends | Select-Object -Unique

Banner "=== AO Hostel - Starting: $($run -join ', ') ==="

# ── BACKEND ───────────────────────────────────────────────────────────────────
function Start-Backend {
    Banner "BACKEND  (Laravel -> http://ao-api.test)"

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

    Info "Storage link..."
    php artisan storage:link 2>&1 | Out-Null

    Info "Running migrations..."
    $migrateOut = php artisan migrate --no-interaction 2>&1
    if ($LASTEXITCODE -eq 0) { Ok "Migrations up to date" }
    else { Warn "Migration issue - check manually"; Write-Host $migrateOut }

    php artisan config:clear 2>&1 | Out-Null
    php artisan cache:clear  2>&1 | Out-Null

    Pop-Location
    Ok "Backend ready    -> http://ao-api.test  (Herd/Nginx)"

    # Also serve on port 8000 so Expo mobile can reach it via the machine's local IP.
    # Herd uses virtual-host routing (ao-api.test) which doesn't resolve from a device;
    # artisan serve binds to all interfaces so any IP on port 8000 reaches the app.
    Info "Starting artisan serve on 0.0.0.0:8000 for mobile..."
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command",
        ("Write-Host 'Backend API dev server - http://0.0.0.0:8000' -ForegroundColor Cyan; " +
         "Set-Location '$BACKEND'; " +
         "php artisan serve --host=0.0.0.0 --port=8000")
    )

    # Wait up to 10 s for port 8000 to open
    $waited = 0
    while ($waited -lt 10) {
        Start-Sleep -Seconds 1
        $waited++
        $conn = Test-NetConnection -ComputerName 127.0.0.1 -Port 8000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($conn.TcpTestSucceeded) { break }
    }
    if ($conn.TcpTestSucceeded) {
        Ok "Artisan serve    -> http://0.0.0.0:8000  (mobile / device access)"
    } else {
        Warn "Port 8000 not responding after 10s - check the artisan serve window for errors"
    }
}

# ── ADMIN ─────────────────────────────────────────────────────────────────────
function Start-Admin {
    Banner "ADMIN PANEL  (Next.js -> http://localhost:3000)"

    Push-Location $ADMIN
    if (-not (Test-Path "node_modules")) {
        Info "Installing npm packages..."
        npm install --silent
        if ($LASTEXITCODE -ne 0) { Warn "npm install failed" }
    }
    Pop-Location

    Info "Opening Admin dev server in new window..."
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command",
        "Write-Host 'Admin Panel - http://localhost:3000' -ForegroundColor Cyan; Set-Location '$ADMIN'; npm run dev"
    )
    Ok "Admin window launched -> http://localhost:3000"
}

# ── GUEST ─────────────────────────────────────────────────────────────────────
function Start-Guest {
    Banner "GUEST WEBSITE  (Next.js -> http://localhost:3001)"

    # Clear cache BEFORE Push-Location so we're in the right directory
    Banner "Clearing Next.js cache..."
    if (Test-Path "$GUEST\.next") {
        Remove-Item -Path "$GUEST\.next" -Recurse -Force
        Ok "Cache cleared from $GUEST\.next"
    } else {
        Info "No cache to clear"
    }

    Push-Location $GUEST
    if (-not (Test-Path "node_modules")) {
        Info "Installing npm packages..."
        npm install --silent
        if ($LASTEXITCODE -ne 0) { Warn "npm install failed" }
    }
    Pop-Location

    Info "Opening Guest dev server in new window..."
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command",
        "Write-Host 'Guest Website - http://localhost:3001' -ForegroundColor Cyan; Set-Location '$GUEST'; npm run dev"
    )
    Ok "Guest window launched -> http://localhost:3001"
}

# ── MOBILE ────────────────────────────────────────────────────────────────────
function Start-Mobile {
    Banner "MOBILE APP  (Expo)"

    Push-Location $MOBILE
    if (-not (Test-Path "node_modules")) {
        Info "Installing npm packages..."
        npm install --silent
        if ($LASTEXITCODE -ne 0) { Warn "npm install failed" }
    }
    Pop-Location

    Info "Opening Expo in new window..."
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command",
        "Write-Host 'Mobile - Expo Dev Server' -ForegroundColor Cyan; Set-Location '$MOBILE'; npx expo start --clear"
    )
    Ok "Expo window launched"
}

# ── DISPATCH ──────────────────────────────────────────────────────────────────
foreach ($svc in $run) {
    switch ($svc) {
        'backend' { Start-Backend }
        'admin'   { Start-Admin   }
        'guest'   { Start-Guest   }
        'mobile'  { Start-Mobile  }
    }
}

# ── SUMMARY ───────────────────────────────────────────────────────────────────
Banner "=== Started: $($run -join ', ') ==="
Write-Host ""
if ('backend' -in $run) { Write-Host "  Backend API    http://ao-api.test        (Herd/Nginx, port 80)" }
if ('backend' -in $run) { Write-Host "  Backend API    http://0.0.0.0:8000       (artisan serve, for mobile)" }
if ('admin'   -in $run) { Write-Host "  Admin Panel    http://localhost:3000     (Next.js)" }
if ('guest'   -in $run) { Write-Host "  Guest Website  http://localhost:3001     (Next.js)" }
if ('mobile'  -in $run) { Write-Host "  Mobile         Expo window               (scan QR with Expo Go)" }
Write-Host ""
Write-Host "  Tip: add real Stripe + Google Maps keys to backend\.env and"
Write-Host "       frontend\guest\.env.local before testing payments and maps"
Write-Host ""
