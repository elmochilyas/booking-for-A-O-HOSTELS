<?php

namespace App\Exceptions;

use Exception;

class InvalidTokenException extends Exception
{
    public function __construct(string $message = 'Invalid or expired token', int $code = 400)
    {
        parent::__construct($message, $code);
    }
}
