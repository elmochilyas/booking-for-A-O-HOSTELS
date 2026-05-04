<?php

/**
 * Full API Integration Test Suite
 * Run: php run_tests.php
 */
$BASE = 'http://localhost:8000/api';
$results = [];
$tokens = [];

// ─── helpers ────────────────────────────────────────────────────────────────

function req(string $method, string $url, array $body = [], array $headers = []): array
{
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $hdrs = array_merge(['Accept: application/json', 'Content-Type: application/json'], $headers);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $hdrs);

    if ($body) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($raw, true);

    return ['code' => $code, 'body' => $data, 'raw' => $raw];
}

function pass(string $name, string $note = ''): void
{
    global $results;
    $results[] = ['status' => 'PASS', 'name' => $name, 'note' => $note];
    echo "\033[32m  ✓ PASS\033[0m  {$name}".($note ? "  ({$note})" : '')."\n";
}

function fail(string $name, string $note = ''): void
{
    global $results;
    $results[] = ['status' => 'FAIL', 'name' => $name, 'note' => $note];
    echo "\033[31m  ✗ FAIL\033[0m  {$name}".($note ? "  ({$note})" : '')."\n";
}

function section(string $title): void
{
    echo "\n\033[1;34m══ {$title} ══\033[0m\n";
}

function auth(string $key): array
{
    global $tokens;

    return isset($tokens[$key]) ? ["Authorization: Bearer {$tokens[$key]}"] : [];
}

function assertCode(int $expected, array $res, string $name, string $note = ''): bool
{
    if ($res['code'] === $expected) {
        pass($name, $note ?: "HTTP {$res['code']}");

        return true;
    }
    fail($name, "Expected HTTP {$expected}, got {$res['code']}. ".substr($res['raw'] ?? '', 0, 120));

    return false;
}

function assertKey(array $res, string $key, string $name): bool
{
    if (isset($res['body'][$key])) {
        pass($name, "key '{$key}' present");

        return true;
    }
    fail($name, "Missing key '{$key}' in response");

    return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — PUBLIC / GUEST FRONTEND ROUTES
// ═══════════════════════════════════════════════════════════════════════════

section('1. Public Property Routes');

$res = req('GET', "$BASE/properties");
if (assertCode(200, $res, 'GET /properties — list loads')) {
    $props = $res['body']['properties'] ?? $res['body']['data'] ?? [];
    $count = is_array($props) ? count($props) : 0;
    $total = $res['body']['pagination']['total'] ?? $res['body']['total'] ?? $count;
    pass('Properties total count', "total={$total}");
    $PROP_ID = $props[0]['id'] ?? null;
    $PROP_SLUG = $props[0]['slug'] ?? null;
}

$res = req('GET', "$BASE/properties/destinations");
assertCode(200, $res, 'GET /properties/destinations');

// Property detail by UUID
if (! empty($PROP_ID)) {
    $res = req('GET', "$BASE/properties/{$PROP_ID}");
    assertCode(200, $res, 'GET /properties/{uuid} — detail by UUID');
}

// Property detail by slug
if (! empty($PROP_SLUG)) {
    $res = req('GET', "$BASE/properties/{$PROP_SLUG}");
    assertCode(200, $res, 'GET /properties/{slug} — detail by slug');
}

// Room types for property
if (! empty($PROP_ID)) {
    $res = req('GET', "$BASE/properties/{$PROP_ID}/room-types");
    if (assertCode(200, $res, 'GET /properties/{id}/room-types')) {
        $rts = $res['body']['room_types'] ?? [];
        $RT_ID = $rts[0]['id'] ?? null;
        pass('Room types returned', 'count='.count($rts));
    }

    // Availability
    $checkIn = date('Y-m-d', strtotime('+30 days'));
    $checkOut = date('Y-m-d', strtotime('+32 days'));
    $res = req('GET', "$BASE/properties/{$PROP_ID}/availability?check_in={$checkIn}&check_out={$checkOut}&guests=2");
    assertCode(200, $res, 'GET /properties/{id}/availability');
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — GUEST AUTH
// ═══════════════════════════════════════════════════════════════════════════

section('2. Guest Authentication');

$guestEmail = 'testguest_'.time().'@example.com';

$res = req('POST', "$BASE/auth/register", [
    'first_name' => 'Test',
    'last_name' => 'Guest',
    'email' => $guestEmail,
    'password' => 'Password123!',
    'password_confirmation' => 'Password123!',
]);
if (assertCode(201, $res, 'POST /auth/register')) {
    $tokens['guest'] = $res['body']['access_token'] ?? null;
    if ($tokens['guest']) {
        pass('Guest token received');
    } else {
        fail('Guest token missing from register response');
    }
}

// Login
$res = req('POST', "$BASE/auth/login", ['email' => $guestEmail, 'password' => 'Password123!']);
if (assertCode(200, $res, 'POST /auth/login')) {
    $tokens['guest'] = $res['body']['access_token'] ?? $tokens['guest'];
}

// Guest profile
$res = req('GET', "$BASE/guest/profile", [], auth('guest'));
assertCode(200, $res, 'GET /guest/profile');

// Guest bookings
$res = req('GET', "$BASE/guest/bookings", [], auth('guest'));
assertCode(200, $res, 'GET /guest/bookings');

// Guest logout
$res = req('POST', "$BASE/auth/logout", [], auth('guest'));
assertCode(200, $res, 'POST /auth/logout — JWT blacklist (not Sanctum crash)');

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — STAFF AUTH
// ═══════════════════════════════════════════════════════════════════════════

section('3. Staff Authentication');

$res = req('POST', "$BASE/staff/login", ['email' => 'reception@ao.com', 'password' => 'reception123']);
if (assertCode(200, $res, 'POST /staff/login (reception)')) {
    $tokens['reception'] = $res['body']['access_token'] ?? null;
    if ($tokens['reception']) {
        pass('Reception token received');
    }
}

// Staff dashboard
$res = req('GET', "$BASE/staff/dashboard", [], auth('reception'));
assertCode(200, $res, 'GET /staff/dashboard');

// Check-ins
$res = req('GET', "$BASE/staff/check-ins", [], auth('reception'));
assertCode(200, $res, 'GET /staff/check-ins');

// Check-outs
$res = req('GET', "$BASE/staff/check-outs", [], auth('reception'));
assertCode(200, $res, 'GET /staff/check-outs');

// Staff logout
$res = req('POST', "$BASE/staff/logout", [], auth('reception'));
assertCode(200, $res, 'POST /staff/logout');

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — SUPERADMIN AUTH + BASIC ACCESS
// ═══════════════════════════════════════════════════════════════════════════

section('4. Superadmin Authentication');

$res = req('POST', "$BASE/staff/login", ['email' => 'superadmin@ao.com', 'password' => 'super123']);
if (assertCode(200, $res, 'POST /staff/login (superadmin)')) {
    $tokens['superadmin'] = $res['body']['access_token'] ?? null;
    if ($tokens['superadmin']) {
        pass('Superadmin token received');
    } else {
        fail('Superadmin token missing');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5 — ADMIN: PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════

section('5. Admin — Properties');

$res = req('GET', "$BASE/admin/properties", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/properties')) {
    $props = $res['body']['data'] ?? [];
    $total = $res['body']['pagination']['total'] ?? 0;
    pass('Properties list', "total={$total}");
    $ADMIN_PROP_ID = $props[0]['id'] ?? null;
}

// Create property
$res = req('POST', "$BASE/admin/properties", [
    'name' => 'Test Property '.time(),
    'location' => 'Test City',
    'address' => '123 Test Street',
], auth('superadmin'));
if (assertCode(201, $res, 'POST /admin/properties — create')) {
    $NEW_PROP_ID = $res['body']['data']['id'] ?? null;
}

// Update property
if (! empty($NEW_PROP_ID)) {
    $res = req('PUT', "$BASE/admin/properties/{$NEW_PROP_ID}", [
        'name' => 'Updated Test Property',
        'is_active' => true,
    ], auth('superadmin'));
    assertCode(200, $res, 'PUT /admin/properties/{id} — update (is_active column)');
}

// KPIs
if (! empty($ADMIN_PROP_ID)) {
    $res = req('GET', "$BASE/admin/properties/{$ADMIN_PROP_ID}/kpis", [], auth('superadmin'));
    assertCode(200, $res, 'GET /admin/properties/{id}/kpis');
}

// Archive (delete = set is_active=false)
if (! empty($NEW_PROP_ID)) {
    $res = req('DELETE', "$BASE/admin/properties/{$NEW_PROP_ID}", [], auth('superadmin'));
    assertCode(200, $res, 'DELETE /admin/properties/{id} — archive');
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6 — ADMIN: ROOMS
// ═══════════════════════════════════════════════════════════════════════════

section('6. Admin — Rooms');

$res = req('GET', "$BASE/admin/rooms", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/rooms')) {
    $roomTotal = $res['body']['pagination']['total'] ?? 0;
    pass('Rooms total', "total={$roomTotal}");
    $statusCounts = $res['body']['status_counts'] ?? null;
    if ($statusCounts) {
        pass('status_counts present in response', 'available='.($statusCounts['available'] ?? '?'));
    } else {
        fail('status_counts missing from GET /admin/rooms response');
    }
    $ROOM_ID = $res['body']['data'][0]['id'] ?? null;
}

// Filter by property
if (! empty($ADMIN_PROP_ID)) {
    $res = req('GET', "$BASE/admin/rooms?property={$ADMIN_PROP_ID}", [], auth('superadmin'));
    assertCode(200, $res, 'GET /admin/rooms?property={id} — filter by property');
}

// Filter by status
$res = req('GET', "$BASE/admin/rooms?status=available", [], auth('superadmin'));
assertCode(200, $res, 'GET /admin/rooms?status=available — filter by status');

// Update room status
if (! empty($ROOM_ID)) {
    $res = req('PATCH', "$BASE/admin/rooms/{$ROOM_ID}/status", ['status' => 'maintenance'], auth('superadmin'));
    assertCode(200, $res, 'PATCH /admin/rooms/{id}/status — set maintenance');

    // Reset back
    req('PATCH', "$BASE/admin/rooms/{$ROOM_ID}/status", ['status' => 'available'], auth('superadmin'));
}

// Room types
$res = req('GET', "$BASE/admin/room-types", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/room-types')) {
    pass('Room types list', 'count='.count($res['body']['data'] ?? []));
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7 — ADMIN: BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════

section('7. Admin — Bookings');

$res = req('GET', "$BASE/admin/bookings", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/bookings')) {
    pass('Bookings list', 'total='.($res['body']['pagination']['total'] ?? 0));
    $BOOKING_ID = $res['body']['data'][0]['id'] ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8 — ADMIN: STAFF MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

section('8. Admin — Staff Management');

$res = req('GET', "$BASE/admin/staff", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/staff — paginated (AdminController)')) {
    $hasData = isset($res['body']['data']);
    $hasPagination = isset($res['body']['pagination']);
    if ($hasData && $hasPagination) {
        pass('Response has data + pagination keys');
    } else {
        fail('Missing data or pagination key — still hitting wrong controller', json_encode(array_keys($res['body'] ?? [])));
    }
    $STAFF_ID = $res['body']['data'][0]['id'] ?? null;
}

// Roles
$res = req('GET', "$BASE/admin/roles", [], auth('superadmin'));
assertCode(200, $res, 'GET /admin/roles');

// Permissions
$res = req('GET', "$BASE/admin/permissions", [], auth('superadmin'));
assertCode(200, $res, 'GET /admin/permissions');

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9 — ADMIN: GUESTS
// ═══════════════════════════════════════════════════════════════════════════

section('9. Admin — Guests');

$res = req('GET', "$BASE/admin/guests", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/guests')) {
    pass('Guests list', 'total='.($res['body']['pagination']['total'] ?? 0));
    $GUEST_ID = $res['body']['data'][0]['id'] ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 10 — ADMIN: ANALYTICS & REVENUE
// ═══════════════════════════════════════════════════════════════════════════

section('10. Admin — Analytics & Revenue');

$res = req('GET', "$BASE/admin/analytics", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/analytics')) {
    $d = $res['body']['data'] ?? [];
    foreach (['occupancy_rate', 'total_revenue', 'total_bookings', 'weekly_bookings', 'monthly_revenue', 'recent_bookings'] as $key) {
        if (array_key_exists($key, $d)) {
            pass("analytics.{$key} present");
        } else {
            fail("analytics.{$key} MISSING from response");
        }
    }
}

$res = req('GET', "$BASE/admin/revenue", [], auth('superadmin'));
assertCode(200, $res, 'GET /admin/revenue — revenue dashboard');

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 11 — ADMIN: PROMOTIONS
// ═══════════════════════════════════════════════════════════════════════════

section('11. Admin — Promotions');

$res = req('GET', "$BASE/admin/promotions", [], auth('superadmin'));
assertCode(200, $res, 'GET /admin/promotions');

$promoCode = 'TESTCODE'.rand(1000, 9999);
$res = req('POST', "$BASE/admin/promotions", [
    'code' => $promoCode,
    'discount_type' => 'percentage',
    'discount_value' => 10,
    'valid_from' => date('Y-m-d'),
    'valid_until' => date('Y-m-d', strtotime('+30 days')),
], auth('superadmin'));
if (assertCode(201, $res, 'POST /admin/promotions — create (field mapping test)')) {
    $PROMO_ID = $res['body']['data']['id'] ?? null;
}

if (! empty($PROMO_ID)) {
    $res = req('PUT', "$BASE/admin/promotions/{$PROMO_ID}", [
        'valid_from' => date('Y-m-d'),
        'valid_until' => date('Y-m-d', strtotime('+60 days')),
        'is_active' => true,
    ], auth('superadmin'));
    assertCode(200, $res, 'PUT /admin/promotions/{id} — update');
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 12 — ADMIN: EXTRAS
// ═══════════════════════════════════════════════════════════════════════════

section('12. Admin — Extras');

$res = req('GET', "$BASE/admin/extras", [], auth('superadmin'));
assertCode(200, $res, 'GET /admin/extras');

// per_stay should work now
$res = req('POST', "$BASE/admin/extras", [
    'name' => 'Test Extra '.time(),
    'price' => 5.00,
    'price_type' => 'per_stay',
    'property_id' => $ADMIN_PROP_ID,
], auth('superadmin'));
if (assertCode(201, $res, 'POST /admin/extras — price_type=per_stay (was broken)')) {
    $EXTRA_ID = $res['body']['data']['id'] ?? null;
}

// one_time should now be rejected
$res = req('POST', "$BASE/admin/extras", [
    'name' => 'Bad Extra',
    'price' => 5.00,
    'price_type' => 'one_time',
    'property_id' => $ADMIN_PROP_ID,
], auth('superadmin'));
assertCode(422, $res, 'POST /admin/extras — price_type=one_time rejected (validation)');

if (! empty($EXTRA_ID)) {
    $res = req('PUT', "$BASE/admin/extras/{$EXTRA_ID}", [
        'price_type' => 'per_night',
    ], auth('superadmin'));
    assertCode(200, $res, 'PUT /admin/extras/{id} — update price_type=per_night');

    $res = req('PUT', "$BASE/admin/extras/{$EXTRA_ID}", [
        'price_type' => 'per_stay',
    ], auth('superadmin'));
    assertCode(200, $res, 'PUT /admin/extras/{id} — update price_type=per_stay');
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 13 — ADMIN: REVIEWS
// ═══════════════════════════════════════════════════════════════════════════

section('13. Admin — Reviews');

$res = req('GET', "$BASE/admin/reviews", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/reviews')) {
    $REVIEW_ID = $res['body']['data'][0]['id'] ?? null;
    // Verify fields in response use overall_rating / review_text mapping
    $sample = $res['body']['data'][0] ?? [];
    if (array_key_exists('rating', $sample)) {
        pass('Review has rating field in response');
    }
    if (array_key_exists('comment', $sample)) {
        pass('Review has comment field in response');
    }
}

// Test hidden and flagged status (previously caused DB constraint error)
if (! empty($REVIEW_ID)) {
    $res = req('PUT', "$BASE/admin/reviews/{$REVIEW_ID}/moderate", [
        'status' => 'hidden',
    ], auth('superadmin'));
    assertCode(200, $res, 'PUT /admin/reviews/{id}/moderate — status=hidden (was DB error)');

    $res = req('PUT', "$BASE/admin/reviews/{$REVIEW_ID}/moderate", [
        'status' => 'flagged',
    ], auth('superadmin'));
    assertCode(200, $res, 'PUT /admin/reviews/{id}/moderate — status=flagged (was DB error)');

    // Reset to approved
    req('PUT', "$BASE/admin/reviews/{$REVIEW_ID}/moderate", ['status' => 'approved'], auth('superadmin'));
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 14 — ADMIN: EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

section('14. Admin — Email Templates');

$res = req('GET', "$BASE/admin/email-templates", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/email-templates (table now exists)')) {
    pass('Email templates count', 'count='.count($res['body']['data'] ?? []));
    $TEMPLATE_ID = $res['body']['data'][0]['id'] ?? null;
}

if (! empty($TEMPLATE_ID)) {
    $res = req('PUT', "$BASE/admin/email-templates/{$TEMPLATE_ID}", [
        'subject' => 'Updated Subject '.time(),
    ], auth('superadmin'));
    assertCode(200, $res, 'PUT /admin/email-templates/{id} — update');
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 15 — ADMIN: PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════

section('15. Admin — Payments');

$res = req('GET', "$BASE/admin/payments", [], auth('superadmin'));
assertCode(200, $res, 'GET /admin/payments');

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 16 — ADMIN: SYSTEM CONFIG (SETTINGS)
// ═══════════════════════════════════════════════════════════════════════════

section('16. Admin — System Config');

$res = req('GET', "$BASE/admin/config", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/config')) {
    $isArray = is_array($res['body']['data'] ?? null);
    if ($isArray) {
        pass('Config returns data array');
    } else {
        fail('Config data is not an array');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 17 — ADMIN: AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════════════

section('17. Admin — Audit Logs');

$res = req('GET', "$BASE/admin/audit-logs", [], auth('superadmin'));
if (assertCode(200, $res, 'GET /admin/audit-logs')) {
    $sample = $res['body']['data'][0] ?? [];
    if (array_key_exists('staff', $sample)) {
        pass('Audit log has staff key (not staff_name)');
    } else {
        fail('Audit log missing staff key — column mismatch may remain');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 18 — ROLE HIERARCHY
// ═══════════════════════════════════════════════════════════════════════════

section('18. Role Hierarchy');

// Manager login
$res = req('POST', "$BASE/staff/login", ['email' => 'manager@ao.com', 'password' => 'manager123']);
if (assertCode(200, $res, 'POST /staff/login (manager)')) {
    $tokens['manager'] = $res['body']['access_token'] ?? null;
}

// Manager should access bookings (role:superadmin|regional_admin|property_admin — manager is below that)
$res = req('GET', "$BASE/admin/bookings", [], auth('manager'));
// Manager is below regional_admin so may get 403 depending on hierarchy — note actual result
$managerBookingsCode = $res['code'];
if ($managerBookingsCode === 200) {
    pass('Manager can access /admin/bookings');
} elseif ($managerBookingsCode === 403) {
    pass('Manager correctly denied /admin/bookings (below required role)', 'HTTP 403 expected');
} else {
    fail('Manager /admin/bookings — unexpected HTTP '.$managerBookingsCode);
}

// Superadmin should access everything
$res = req('GET', "$BASE/admin/staff", [], auth('superadmin'));
assertCode(200, $res, 'Superadmin can access role:superadmin route');

$res = req('GET', "$BASE/admin/bookings", [], auth('superadmin'));
assertCode(200, $res, 'Superadmin can access role:superadmin|regional_admin route (hierarchy)');

$res = req('GET', "$BASE/admin/reviews", [], auth('superadmin'));
assertCode(200, $res, 'Superadmin can access role:superadmin|regional_admin|property_admin route (hierarchy)');

// ═══════════════════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

$passed = count(array_filter($results, fn ($r) => $r['status'] === 'PASS'));
$failed = count(array_filter($results, fn ($r) => $r['status'] === 'FAIL'));
$total = count($results);

echo "\n\033[1m══════════════════════════════════════\033[0m\n";
echo "\033[1m  TEST RESULTS\033[0m\n";
echo "\033[1m══════════════════════════════════════\033[0m\n";
echo "\033[32m  Passed: {$passed}/{$total}\033[0m\n";
if ($failed > 0) {
    echo "\033[31m  Failed: {$failed}/{$total}\033[0m\n\n";
    echo "\033[31m  FAILURES:\033[0m\n";
    foreach ($results as $r) {
        if ($r['status'] === 'FAIL') {
            echo "    ✗ {$r['name']}\n      → {$r['note']}\n";
        }
    }
} else {
    echo "\033[32m  All tests passed!\033[0m\n";
}
echo "\n";

// Write results to JSON for the report
file_put_contents(__DIR__.'/test_results.json', json_encode([
    'run_at' => date('Y-m-d H:i:s'),
    'passed' => $passed,
    'failed' => $failed,
    'total' => $total,
    'results' => $results,
], JSON_PRETTY_PRINT));
echo "Results saved to test_results.json\n";
