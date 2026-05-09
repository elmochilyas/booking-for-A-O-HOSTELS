<?php

declare(strict_types=1);

use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The base test case class for Pest tests. Uses the Laravel TestCase
| to provide full framework functionality.
|
*/

uses(TestCase::class)->in('Feature', 'Unit', 'Arch');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| Here you may define custom expectation methods for Pest.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| Here you may define custom helper functions for Pest.
|
*/

function something()
{
    // ..
}
