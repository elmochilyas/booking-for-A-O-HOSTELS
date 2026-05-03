<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: dirname(__DIR__).'/routes/api.php',
        web: dirname(__DIR__).'/routes/web.php',
        commands: dirname(__DIR__).'/routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'auth.jwt' => \App\Http\Middleware\JwtAuthenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();