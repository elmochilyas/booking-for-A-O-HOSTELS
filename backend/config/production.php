<?php

use Monolog\Handler\StreamHandler;

return [
    'app' => [
        'name' => env('APP_NAME', 'A&O Hostels'),
        'env' => env('APP_ENV', 'production'),
        'debug' => false,
        'url' => env('APP_URL', 'https://api.ao-hostels.com'),
        'frontend_url' => env('FRONTEND_URL', 'https://ao-hostels.com'),
        'timezone' => 'Europe/Berlin',
        'locale' => 'en',
        'fallback_locale' => 'en',
        'key' => env('APP_KEY'),
        'cipher' => 'AES-256-CBC',
        'maintenance' => [
            'driver' => 'file',
        ],
    ],

    'database' => [
        'default' => env('DB_CONNECTION', 'mysql'),
        'connections' => [
            'mysql' => [
                'driver' => 'mysql',
                'host' => env('DB_HOST', '127.0.0.1'),
                'port' => env('DB_PORT', '3306'),
                'database' => env('DB_DATABASE', 'ao_hostels'),
                'username' => env('DB_USERNAME', 'root'),
                'password' => env('DB_PASSWORD', ''),
                'unix_socket' => env('DB_SOCKET', ''),
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'prefix' => '',
                'prefix_indexes' => true,
                'strict' => true,
                'engine' => 'InnoDB',
                'options' => extension_loaded('pdo_mysql') ? array_filter([
                    1014 => env('MYSQL_ATTR_SSL_CA'),
                ]) : [],
            ],
        ],
        'migrations' => 'migrations',
    ],

    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'default' => [
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD', null),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
        'cache' => [
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD', null),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],
    ],

    'cache' => [
        'default' => env('CACHE_DRIVER', 'redis'),
        'stores' => [
            'redis' => [
                'driver' => 'redis',
                'connection' => 'cache',
                'lock_connection' => 'default',
            ],
            'array' => [
                'driver' => 'array',
                'serialize' => false,
            ],
        ],
        'prefix' => env('CACHE_PREFIX', 'ao_hostels_cache'),
    ],

    'queue' => [
        'default' => env('QUEUE_CONNECTION', 'redis'),
        'connections' => [
            'sync' => [
                'driver' => 'sync',
            ],
            'redis' => [
                'driver' => 'redis',
                'connection' => 'default',
                'queue' => env('REDIS_QUEUE', 'default'),
                'retry_after' => 90,
                'block_for' => null,
                'after_commit' => false,
            ],
        ],
    ],

    'session' => [
        'driver' => env('SESSION_DRIVER', 'redis'),
        'lifetime' => env('SESSION_LIFETIME', 120),
        'expire_on_close' => false,
        'encrypt' => true,
        'files' => storage_path('framework/sessions'),
        'connection' => env('SESSION_CONNECTION'),
        'table' => 'sessions',
        'store' => env('SESSION_STORE'),
        'lottery' => [2, 100],
        'cookie' => env('SESSION_COOKIE', 'ao_hostels_session'),
        'path' => '/',
        'domain' => env('SESSION_DOMAIN'),
        'secure' => env('SESSION_SECURE_COOKIE'),
        'http_only' => true,
        'same_site' => 'lax',
        'partitioned' => false,
    ],

    'logging' => [
        'default' => env('LOG_CHANNEL', 'stack'),
        'deprecations' => [
            'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
            'trace' => false,
        ],
        'channels' => [
            'stack' => [
                'driver' => 'stack',
                'channels' => ['single', 'stderr'],
                'ignore_exceptions' => false,
            ],
            'single' => [
                'driver' => 'single',
                'path' => storage_path('logs/laravel.log'),
                'level' => env('LOG_LEVEL', 'debug'),
                'replace_placeholders' => true,
            ],
            'stderr' => [
                'driver' => 'monolog',
                'level' => env('LOG_LEVEL', 'debug'),
                'handler' => StreamHandler::class,
                'formatter' => env('LOG_STDERR_FORMATTER'),
                'with' => [
                    'stream' => 'php://stderr',
                ],
            ],
            'emergency' => [
                'path' => storage_path('logs/laravel.log'),
            ],
        ],
    ],

    'mail' => [
        'default' => env('MAIL_MAILER', 'smtp'),
        'mailers' => [
            'smtp' => [
                'transport' => 'smtp',
                'host' => env('MAIL_HOST', 'smtp.mailgun.org'),
                'port' => env('MAIL_PORT', 587),
                'encryption' => env('MAIL_ENCRYPTION', 'tls'),
                'username' => env('MAIL_USERNAME'),
                'password' => env('MAIL_PASSWORD'),
                'timeout' => null,
                'local_domain' => env('MAIL_EHLO_DOMAIN'),
            ],
        ],
        'from' => [
            'address' => env('MAIL_FROM_ADDRESS', 'noreply@ao-hostels.com'),
            'name' => env('MAIL_FROM_NAME', 'A&O Hostels'),
        ],
    ],

    'cors' => [
        'paths' => ['api/*', 'sanctum/csrf-cookie'],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'https://ao-hostels.com,https://admin.ao-hostels.com')),
        'allowed_origins_patterns' => [],
        'allowed_headers' => ['*'],
        'exposed_headers' => [],
        'max_age' => 0,
        'supports_credentials' => true,
    ],

    'trustedproxies' => '*',
];
