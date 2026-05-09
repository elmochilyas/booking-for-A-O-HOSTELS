<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

class EmailNotVerifiedException extends Exception
{
    public function __construct(string $message = 'Email not verified', int $code = 403)
    {
        parent::__construct($message, $code);
    }
}
