<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'A&O Hostels API',
        'version' => '1.0.0',
        'status' => 'running',
    ]);
});

Route::get('/health', function () {
    return response()->json(['status' => 'healthy', 'timestamp' => now()]);
});
