# Phase 9: New L13 Features — OPTIONAL (Skipped)

**Date:** 2026-05-05  
**Status:** Skipped — Optional features not needed by project

---

## Evaluation Summary

| Task | Feature | Needed? | Reason |
|------|----------|---------|--------|
| 9.1 | JSON:API Resources | ❌ No | Project uses basic `JsonResource`. No API spec compliance requirement. |
| 9.2 | Semantic/Vector Search | ❌ No | No PostgreSQL + pgvector. No document search feature. |
| 9.3 | Laravel AI SDK | ❌ No | Package not installed. No AI features in project. |
| 9.4 | Passkeys Authentication | ❌ No | No passwordless auth requirement. |

---

## L13 Expert Rules Compliance (for future implementation)

### 9.1 JSON:API Resources (RULE JAPI-01 to JAPI-04)
**When needed:**
```php
// app/Http/Resources/BookingJsonApiResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonApiResource;

class BookingJsonApiResource extends JsonApiResource
{
    public function toAttributes($request): array
    {
        return [
            'check_in' => $this->check_in_date->toIso8601String(),
            'check_out' => $this->check_out_date->toIso8601String(),
            'guest_count' => $this->guest_count,
            'total_price' => $this->total_price,
            'status' => $this->status->value,
        ];
    }

    public function toRelationships($request): array
    {
        return [
            'guest' => GuestResource::make($this->whenLoaded('guest')),
            'property' => PropertyResource::make($this->whenLoaded('property')),
        ];
    }
}
```

### 9.2 Semantic/Vector Search (RULE VEC-01 to VEC-07)
**Prerequisites:** PostgreSQL + pgvector extension  
**When needed:**
```php
// Migration (requires pgvector)
Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->vector('embedding', 1536); // OpenAI text-embedding-3-small
    $table->timestamps();
});

// Observer (RULE VEC-02)
class DocumentObserver
{
    public function creating(Document $document): void
    {
        $document->embedding = Str::of($document->title . ' ' . $document->body)
            ->toEmbeddings();
    }
}
```

### 9.3 Laravel AI SDK (RULE AI-01 to AI-08)
**When needed:**
```bash
composer require laravel/ai
```

```php
// config/ai.php (RULE AI-03: provider failover)
return [
    'default' => 'openai',
    'providers' => [
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'model' => 'gpt-4',
        ],
        'anthropic' => [
            'api_key' => env('ANTHROPIC_API_KEY'),
            'model' => 'claude-3',
        ],
    ],
    'failover' => ['openai', 'anthropic'], // RULE AI-03
];
```

### 9.4 Passkeys Authentication (RULE PASS-01 to PASS-05)
**When needed:**
```bash
composer require laravel/passkeys
php artisan passkeys:install
```

```php
// RULE PASS-01: Passkeys live in app/Auth/Passkeys/
namespace App\Auth\Passkeys;

use Illuminate\Support\Facades\Auth;

class PasskeyOptions
{
    public function generate(): array
    {
        return Auth::guard('passkey')->options(
            user: Auth::user(),
        );
    }
}
```

---

## Conclusion

Phase 9 is **complete** — all optional features were evaluated against L13 expert rules.  
None are needed by the A-O-HOSTELS project at this time.

**Next step:** Commit Phase 8 & 9 changes.
