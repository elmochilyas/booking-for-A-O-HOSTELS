<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\AuthController;

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