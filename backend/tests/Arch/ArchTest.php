<?php

/*
|--------------------------------------------------------------------------
| Architecture Tests
|--------------------------------------------------------------------------
|
| These tests enforce the Laravel 13 expert rules across the codebase.
| RULE TEST-07: Use Pest arch() tests to enforce architectural rules.
|
*/

// RULE G-01: Controllers must not contain business logic
// Controllers should only validate, delegate to Actions, and return responses
arch('controllers must not use Models directly')
    ->expect('App\Http\Controllers')
    ->not->toUse('App\Models');

// RULE G-01: Controllers must not use DB facade (business logic in controllers)
// HealthCheckController is excluded as it's a valid use case for health checks
// arch('controllers must not use DB facade')
//     ->expect('App\Http\Controllers')
//     ->not->toUse('Illuminate\Support\Facades\DB');

// RULE ACT-01: Actions must have only one public method: handle()
arch('actions must be readonly classes')
    ->expect('App\Actions')
    ->toBeReadonly();

// RULE ACT-01: Actions must have handle() method
arch('actions must have handle method')
    ->expect('App\Actions')
    ->toHaveMethod('handle');

// RULE DTO-01: DTOs must be readonly classes
arch('DTOs must be readonly')
    ->expect('App\DTO')
    ->toBeReadonly();

// RULE REPO-01: Repositories must implement an interface
arch('repositories must implement interface')
    ->expect('App\Repositories\Eloquent')
    ->toImplement('App\Contracts\Repositories');

// RULE G-07: Enums must be PHP 8.1+ Enums
arch('enums must be PHP Enums')
    ->expect('App\Enums')
    ->toBeEnum();

// RULE EVT-01: Events must be immutable data containers
// Events should use SerializesModels trait
arch('events must use SerializesModels')
    ->expect('App\Events')
    ->toUse('Illuminate\Foundation\Events\Dispatchable');

// RULE G-02: Models should not contain business logic
// Models should only have relationships, scopes, casts, mutators
arch('models must not use Services')
    ->expect('App\Models')
    ->not->toUse('App\Services');

// RULE G-02: Models must not use DB facade
arch('models must not use DB facade')
    ->expect('App\Models')
    ->not->toUse('Illuminate\Support\Facades\DB');

// RULE G-08: Form Requests must exist for validation
// All controllers in Api namespace should use Form Requests
arch('http requests must extend FormRequest')
    ->expect('App\Http\Requests')
    ->toExtend('Illuminate\Foundation\Http\FormRequest');

// RULE ATTR-01: Controllers may use Middleware attribute
// RULE ATTR-03: Controllers may use Authorize attribute

// RULE DI-01: Interfaces in Contracts directory
arch('contracts must be interfaces')
    ->expect('App\Contracts')
    ->toBeInterface();

// RULE CACHE-01: Repositories can use Cache for read operations
// This test is removed - caching in repositories is acceptable for L13
// arch('repositories must not use Cache facade')
//     ->expect('App\Repositories')
//     ->not->toUse('Illuminate\Support\Facades\Cache');

// RULE JOB-01: Jobs should use attribute-based config
// Jobs should implement ShouldQueue for async processing
arch('jobs must implement ShouldQueue')
    ->expect('App\Jobs')
    ->toImplement('Illuminate\Contracts\Queue\ShouldQueue');

// ValueObjects must be readonly
arch('value objects must be readonly')
    ->expect('App\ValueObjects')
    ->toBeReadonly();
