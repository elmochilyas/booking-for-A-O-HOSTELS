<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\StaffController;
use App\Modules\Admin\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::prefix('properties')->group(function () {
    Route::get('/', [PropertyController::class, 'index']);
    Route::get('/destinations', [PropertyController::class, 'destinations']);
    Route::get('/{id}', [PropertyController::class, 'show']);
    Route::get('/{id}/rooms', [RoomController::class, 'propertyRooms']);
    Route::get('/{id}/room-types', [RoomController::class, 'propertyRoomTypes']);
    Route::get('/{id}/availability', [RoomController::class, 'availability']);

    Route::middleware(['auth.jwt', 'role:admin|manager'])->group(function () {
        Route::post('/', [PropertyController::class, 'store']);
        Route::put('/{id}', [PropertyController::class, 'update']);
        Route::delete('/{id}', [PropertyController::class, 'destroy']);
    });
});

Route::prefix('bookings')->group(function () {
    Route::get('/', [BookingController::class, 'index']);
    Route::get('/availability', [BookingController::class, 'availability']);
    Route::get('/{id}', [BookingController::class, 'show']);

    Route::middleware(['auth.jwt'])->group(function () {
        Route::post('/', [BookingController::class, 'store']);
        Route::put('/{id}', [BookingController::class, 'update']);
        Route::delete('/{id}', [BookingController::class, 'cancel']);
        Route::post('/{id}/check-in', [BookingController::class, 'checkIn']);
        Route::post('/{id}/check-out', [BookingController::class, 'checkOut']);
    });
});

Route::prefix('payments')->group(function () {
    Route::post('/create-intent', [PaymentController::class, 'createIntent']);
    Route::post('/webhook', [PaymentWebhookController::class, 'handle']);
    Route::post('/refund', [PaymentController::class, 'refund']);

    Route::middleware(['auth.jwt'])->group(function () {
        Route::get('/booking/{bookingId}', [PaymentController::class, 'bookingPayments']);
    });
});

Route::prefix('guest')->middleware(['auth.jwt'])->group(function () {
    Route::get('/profile', [GuestController::class, 'profile']);
    Route::put('/profile', [GuestController::class, 'updateProfile']);
    Route::post('/change-password', [GuestController::class, 'changePassword']);
    Route::put('/notifications', [GuestController::class, 'updateNotifications']);
    Route::delete('/account', [GuestController::class, 'deleteAccount']);
    Route::get('/bookings', [GuestController::class, 'bookings']);
    Route::get('/loyalty', [GuestController::class, 'loyalty']);
    Route::post('/loyalty/join', [GuestController::class, 'joinLoyalty']);
    Route::post('/loyalty/redeem', [GuestController::class, 'redeemLoyaltyPoints']);
});

Route::prefix('staff')->group(function () {
    Route::post('/login', [StaffController::class, 'login']);
    Route::post('/logout', [StaffController::class, 'logout']);

    Route::middleware(['auth.jwt', 'role:reception|manager|admin|superadmin'])->group(function () {
        Route::get('/dashboard', [StaffController::class, 'dashboard']);
        Route::get('/check-ins', [StaffController::class, 'todayCheckIns']);
        Route::get('/check-outs', [StaffController::class, 'todayCheckOuts']);
        Route::get('/guest/{id}', [StaffController::class, 'guestDetails']);
    });
});

Route::prefix('admin')->middleware(['auth.jwt', 'role:manager|admin|superadmin'])->group(function () {
    Route::get('/analytics', [ReportController::class, 'analytics']);
    Route::get('/reports', [ReportController::class, 'reports']);
    Route::post('/staff', [StaffController::class, 'store']);
    Route::put('/staff/{id}', [StaffController::class, 'update']);
    Route::delete('/staff/{id}', [StaffController::class, 'destroy']);
});

Route::prefix('invoices')->middleware(['auth.jwt'])->group(function () {
    Route::get('/{bookingId}', [InvoiceController::class, 'generate']);
    Route::get('/download/{bookingId}', [InvoiceController::class, 'download']);
});

Route::prefix('admin')->group(function () {
    Route::get('/seed', [AdminController::class, 'seedData']);

    Route::middleware(['auth.jwt', 'role:superadmin'])->group(function () {
        Route::get('/staff', [AdminController::class, 'getStaff']);
        Route::post('/staff', [AdminController::class, 'createStaff']);
        Route::get('/staff/{id}', [AdminController::class, 'getStaffById']);
        Route::put('/staff/{id}', [AdminController::class, 'updateStaff']);
        Route::delete('/staff/{id}', [AdminController::class, 'deleteStaff']);
        Route::post('/staff/{id}/force-logout', [AdminController::class, 'forceLogout']);

        Route::get('/roles', [AdminController::class, 'getRoles']);
        Route::get('/permissions', [AdminController::class, 'getPermissions']);

        Route::get('/properties', [AdminController::class, 'getProperties']);
        Route::post('/properties', [AdminController::class, 'createProperty']);
        Route::put('/properties/{id}', [AdminController::class, 'updateProperty']);
        Route::delete('/properties/{id}', [AdminController::class, 'deleteProperty']);
        Route::get('/properties/{id}/kpis', [AdminController::class, 'getPropertyKpis']);

        Route::get('/rooms', [AdminController::class, 'getRooms']);
        Route::post('/rooms', [AdminController::class, 'createRoom']);
        Route::put('/rooms/{id}', [AdminController::class, 'updateRoom']);
        Route::patch('/rooms/{id}/status', [AdminController::class, 'updateRoomStatus']);

        Route::get('/room-types', [AdminController::class, 'getRoomTypes']);
        Route::post('/room-types', [AdminController::class, 'createRoomType']);
        Route::put('/room-types/{id}', [AdminController::class, 'updateRoomType']);
    });

    Route::middleware(['auth.jwt', 'role:superadmin|regional_admin|property_admin'])->group(function () {
        Route::get('/bookings', [AdminController::class, 'getBookings']);
        Route::put('/bookings/{id}', [AdminController::class, 'updateBooking']);
        Route::delete('/bookings/{id}', [AdminController::class, 'cancelBooking']);
        Route::post('/bookings/{id}/refund', [AdminController::class, 'refundBooking']);
        Route::get('/bookings/export', [AdminController::class, 'exportBookings']);

        Route::get('/guests', [AdminController::class, 'getGuests']);
        Route::put('/guests/{id}', [AdminController::class, 'updateGuest']);
        Route::post('/guests/{id}/ban', [AdminController::class, 'banGuest']);
        Route::post('/guests/{id}/unban', [AdminController::class, 'unbanGuest']);
        Route::post('/guests/merge', [AdminController::class, 'mergeGuests']);
        Route::get('/guests/{id}/export', [AdminController::class, 'exportGuestData']);
        Route::delete('/guests/{id}/data', [AdminController::class, 'deleteGuestData']);

        Route::get('/payments', [AdminController::class, 'getPayments']);
        Route::get('/revenue', [AdminController::class, 'getRevenueDashboard']);
    });

    Route::middleware(['auth.jwt', 'role:superadmin|regional_admin|property_admin'])->group(function () {
        Route::get('/reviews', [AdminController::class, 'getReviews']);
        Route::put('/reviews/{id}/moderate', [AdminController::class, 'moderateReview']);

        Route::get('/promotions', [AdminController::class, 'getPromotions']);
        Route::post('/promotions', [AdminController::class, 'createPromotion']);
        Route::put('/promotions/{id}', [AdminController::class, 'updatePromotion']);
        Route::delete('/promotions/{id}', [AdminController::class, 'deletePromotion']);

        Route::get('/extras', [AdminController::class, 'getExtras']);
        Route::post('/extras', [AdminController::class, 'createExtra']);
        Route::put('/extras/{id}', [AdminController::class, 'updateExtra']);
        Route::delete('/extras/{id}', [AdminController::class, 'deleteExtra']);

        Route::get('/email-templates', [AdminController::class, 'getEmailTemplates']);
        Route::put('/email-templates/{id}', [AdminController::class, 'updateEmailTemplate']);
        Route::post('/announcements', [AdminController::class, 'sendAnnouncement']);

        Route::get('/config', [AdminController::class, 'getSystemConfig']);
        Route::put('/config', [AdminController::class, 'updateSystemConfig']);
    });

    Route::middleware(['auth.jwt', 'role:superadmin'])->group(function () {
        Route::get('/audit-logs', [AdminController::class, 'getAuditLogs']);
    });

    Route::middleware(['auth.jwt', 'role:superadmin|regional_admin|property_admin'])->group(function () {
        Route::get('/analytics', [AdminController::class, 'getAnalytics']);
    });
});
