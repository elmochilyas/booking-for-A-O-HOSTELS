<?php>

return [
    /*
    |--------------------------------------------------------------------------
    | Default AI Provider
    |--------------------------------------------------------------------------
    |
    | RULE AI-03: Always configure provider failover in config/ai.php
    | — never rely on a single provider.
    |
    */

    'default' => env('AI_PROVIDER', 'openai'),

    /*
    |--------------------------------------------------------------------------
    | AI Providers
    |--------------------------------------------------------------------------
    |
    | RULE AI-02: Tools used by agents are injected via DI
    | — never instantiated inside the Agent.
    |
    */

    'providers' => [
        'openai' => [
            'driver' => 'openai',
            'api_key' => env('OPENAI_API_KEY'),
            'model' => env('OPENAI_MODEL', 'gpt-4'),
            'embedding_model' => env('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small'),
        ],

        'anthropic' => [
            'driver' => 'anthropic',
            'api_key' => env('ANTHROPIC_API_KEY'),
            'model' => env('ANTHROPIC_MODEL', 'claude-3-opus'),
        ],

        'gemini' => [
            'driver' => 'gemini',
            'api_key' => env('GEMINI_API_KEY'),
            'model' => env('GEMINI_MODEL', 'gemini-pro'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Provider Failover
    |--------------------------------------------------------------------------
    |
    | RULE AI-03: Configure failover — never rely on single provider.
    |
    */

    'failover' => ['openai', 'anthropic', 'gemini'],

    /*
    |--------------------------------------------------------------------------
    | Fake Provider for Testing
    |--------------------------------------------------------------------------
    |
    | RULE AI-08: Test AI features using fake providers
    | — never call real AI APIs in tests.
    |
    */

    'testing' => [
        'driver' => 'fake',
    ],
];
