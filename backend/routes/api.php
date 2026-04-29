<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Properties\Controllers\PropertyController;
use App\Modules\Bookings\Controllers\BookingController;
use App\Modules\Payments\Controllers\PaymentController;
use App\Modules\Payments\Controllers\WebhookController;
use App\Modules\Staff\Controllers\StaffController;
use App\Modules\Staff\Controllers\ReportController;
use App\Http\Controllers\HealthCheckController;

Route::get('/health', [HealthCheckController::class, 'check']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'guestLogin']);
    Route::post('/staff/login', [AuthController::class, 'staffLogin']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    
    Route::middleware('jwt')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::prefix('properties')->group(function () {
    Route::get('/', [PropertyController::class, 'index']);
    Route::get('/{id}', [PropertyController::class, 'show']);
    Route::get('/{id}/room-types', [PropertyController::class, 'roomTypes']);
    Route::get('/{id}/rooms', [PropertyController::class, 'rooms']);
    
    Route::middleware('jwt')->group(function () {
        Route::post('/', [PropertyController::class, 'store']);
        Route::put('/{id}', [PropertyController::class, 'update']);
        Route::delete('/{id}', [PropertyController::class, 'destroy']);
        Route::post('/{id}/room-types', [PropertyController::class, 'createRoomType']);
    });
});

Route::prefix('bookings')->group(function () {
    Route::get('/availability', [BookingController::class, 'searchAvailability']);
    Route::post('/', [BookingController::class, 'store']);
    Route::get('/{id}', [BookingController::class, 'show']);
    
    Route::middleware('jwt')->group(function () {
        Route::post('/{id}/confirm', [BookingController::class, 'confirm']);
        Route::post('/{id}/cancel', [BookingController::class, 'cancel']);
        Route::post('/{id}/check-in', [BookingController::class, 'checkIn']);
        Route::post('/{id}/check-out', [BookingController::class, 'checkOut']);
        Route::get('/guest/{guestId}', [BookingController::class, 'guestBookings']);
    });
});

Route::prefix('payments')->group(function () {
    Route::post('/create-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/confirm', [PaymentController::class, 'confirmPayment']);
    Route::get('/booking/{bookingId}', [PaymentController::class, 'getPaymentDetails']);
    Route::get('/breakdown', [PaymentController::class, 'getPaymentBreakdown']);
    Route::post('/refund', [PaymentController::class, 'processRefund']);
    
    Route::post('/webhook/stripe', [WebhookController::class, 'handleStripeWebhook']);
});

Route::prefix('staff')->middleware('jwt')->group(function () {
    Route::get('/', [StaffController::class, 'index']);
    Route::post('/', [StaffController::class, 'store']);
    Route::get('/{id}', [StaffController::class, 'show']);
    Route::put('/{id}', [StaffController::class, 'update']);
    Route::delete('/{id}', [StaffController::class, 'destroy']);
    Route::post('/{id}/toggle-active', [StaffController::class, 'toggleActive']);
    Route::get('/property/{propertyId}', [StaffController::class, 'byProperty']);
});

Route::prefix('reports')->middleware('jwt')->group(function () {
    Route::get('/occupancy', [ReportController::class, 'getOccupancy']);
    Route::get('/revenue', [ReportController::class, 'getRevenue']);
    Route::get('/bookings', [ReportController::class, 'getBookingStats']);
    Route::get('/daily', [ReportController::class, 'getDailyStats']);
    Route::get('/dashboard', [ReportController::class, 'getDashboard']);
    Route::get('/adr', [ReportController::class, 'getADR']);
    Route::get('/revpar', [ReportController::class, 'getRevPAR']);
});