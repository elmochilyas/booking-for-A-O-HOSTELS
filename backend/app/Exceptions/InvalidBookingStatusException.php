<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

class InvalidBookingStatusException extends Exception
{
    public function __construct(string $message = 'Invalid booking status', int $code = 422)
    {
        parent::__construct($message, $code);
    }
}
