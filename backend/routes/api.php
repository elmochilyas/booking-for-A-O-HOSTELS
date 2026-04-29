<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\InvoiceController;
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
    Route::get('/bookings', [GuestController::class, 'bookings']);
    Route::get('/loyalty', [GuestController::class, 'loyalty']);
});

Route::prefix('staff')->group(function () {
    Route::post('/login', [StaffController::class, 'login']);
    
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
    Route::get('/staff', [StaffController::class, 'index']);
    Route::post('/staff', [StaffController::class, 'store']);
    Route::put('/staff/{id}', [StaffController::class, 'update']);
    Route::delete('/staff/{id}', [StaffController::class, 'destroy']);
});

Route::prefix('invoices')->middleware(['auth.jwt'])->group(function () {
    Route::get('/{bookingId}', [InvoiceController::class, 'generate']);
    Route::get('/download/{bookingId}', [InvoiceController::class, 'download']);
});