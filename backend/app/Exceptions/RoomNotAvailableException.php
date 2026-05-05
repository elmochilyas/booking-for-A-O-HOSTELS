<?php

namespace App\Exceptions;

use Exception;

class RoomNotAvailableException extends Exception
{
    public function __construct(string $message = 'Room not available', int $code = 422)
    {
        parent::__construct($message, $code);
    }
}
