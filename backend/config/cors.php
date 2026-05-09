<?php

declare(strict_types=1);

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',  // admin panel
        'http://localhost:3001',  // guest website
        'http://ao-api.test',      // backend via Herd
        'https://ao-api.test',     // backend via Herd (HTTPS)
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
