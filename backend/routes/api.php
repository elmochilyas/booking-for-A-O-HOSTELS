<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Properties\Controllers\PropertyController;
use App\Modules\Bookings\Controllers\BookingController;

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