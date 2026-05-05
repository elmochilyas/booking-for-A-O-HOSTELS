# LARAVEL 13 EXPERT RULES — AI CODING AGENT
## Production-Grade Patterns · Released March 17, 2026 · PHP 8.3+

> **HOW TO USE THIS FILE**
> This is a rules file for an AI coding agent. Every section defines WHAT to do,
> WHEN to do it, and HOW to implement it correctly in Laravel 13.
> Follow these rules strictly when generating, reviewing, or refactoring Laravel code.

---

## ⚠️ LARAVEL 13 HARD REQUIREMENTS

```
PHP minimum:    8.3 (drops 8.1 and 8.2 — do NOT generate code using PHP 8.1/8.2-only syntax)
PHP supported:  8.3, 8.4, 8.5 — generate code compatible with this range unless pinned
Laravel:        ^13.0
Symfony:        7.4 or 8.0 components
CSRF:           Use PreventRequestForgery — NOT the old VerifyCsrfToken class name
Kernel:         app/Http/Kernel.php is REMOVED — all middleware config lives in bootstrap/app.php
Named args:     Avoid named arguments on core Laravel framework methods (parameter names may change)
```

---

## TABLE OF CONTENTS

1. [Global Rules](#1-global-rules)
2. [Architecture & Folder Structure](#2-architecture--folder-structure)
3. [PHP Attribute-Based Configuration — NEW IN L13](#3-php-attribute-based-configuration--new-in-l13)
4. [Service Container & Dependency Injection](#4-service-container--dependency-injection)
5. [Action Pattern](#5-action-pattern)
6. [Data Transfer Objects](#6-data-transfer-objects)
7. [Repository Pattern](#7-repository-pattern)
8. [Pipeline Pattern](#8-pipeline-pattern)
9. [Authorization — Policies & Gates](#9-authorization--policies--gates)
10. [Authorization — RBAC / ABAC / ReBAC / PBAC](#10-authorization--rbac--abac--rebac--pbac)
11. [Events, Listeners & Subscribers](#11-events-listeners--subscribers)
12. [Eloquent Observers](#12-eloquent-observers)
13. [Advanced Eloquent](#13-advanced-eloquent)
14. [Custom Eloquent Casts & Value Objects](#14-custom-eloquent-casts--value-objects)
15. [Jobs, Queues & Batching](#15-jobs-queues--batching)
16. [Queue Routing — NEW IN L13](#16-queue-routing--new-in-l13)
17. [Advanced Caching — UPDATED IN L13](#17-advanced-caching--updated-in-l13)
18. [JSON:API Resources — NEW IN L13](#18-jsonapi-resources--new-in-l13)
19. [Semantic & Vector Search — NEW IN L13](#19-semantic--vector-search--new-in-l13)
20. [Laravel AI SDK — NEW IN L13](#20-laravel-ai-sdk--new-in-l13)
21. [Typed Configuration — NEW IN L13](#21-typed-configuration--new-in-l13)
22. [Passkeys Authentication — NEW IN L13](#22-passkeys-authentication--new-in-l13)
23. [CQRS Pattern](#23-cqrs-pattern)
24. [Event Sourcing](#24-event-sourcing)
25. [Multi-Tenancy](#25-multi-tenancy)
26. [Advanced Testing](#26-advanced-testing)
27. [Decision Trees](#27-decision-trees)
28. [Quick Reference — Artisan Commands](#28-quick-reference--artisan-commands)

---

## 1. GLOBAL RULES

```
RULE G-01: Never put business logic in Controllers. Controllers: validate, delegate, return.
RULE G-02: Never put business logic in Models. Models: relationships, scopes, casts, mutators.
RULE G-03: Always use type hints and return types on every method (PHP 8.3 strict).
RULE G-04: Always use readonly classes for DTOs and Value Objects.
RULE G-05: Always wrap related DB writes in DB::transaction(). Never leave partial writes.
RULE G-06: Dispatch events AFTER successful transactions — use ShouldDispatchAfterCommit.
RULE G-07: Use PHP 8.1+ Enums for ALL fixed-state fields (status, type, role, method, etc.).
RULE G-08: Always use Form Requests for validation — never validate inside the controller method.
RULE G-09: Prefer named constructors (fromRequest, fromArray) on DTOs over manual instantiation.
RULE G-10: Interfaces go in app/Contracts/. Always bind them in a ServiceProvider.
RULE G-11: Never call app()->make() inside business logic — use constructor injection only.
RULE G-12: Always eager load relationships in controllers — never lazy-load in loops or views.
RULE G-13: Always paginate collection endpoints. Never return unbounded collections to the client.
RULE G-14: Avoid named arguments on core Laravel framework methods (L13 compatibility warning).
RULE G-15: PHP minimum is 8.3 — use typed class constants, improved readonly, json_validate().
RULE G-16: Never reference app/Http/Kernel.php — it is removed. Use bootstrap/app.php for all
           middleware, exception, and routing configuration.
RULE G-17: Use typed config retrieval (config('key', as: 'bool')) for all config reads where
           the type is known — prevents silent type-coercion bugs.
```

---

## 2. ARCHITECTURE & FOLDER STRUCTURE

### Canonical Folder Layout

```
app/
├── Actions/            # Single-responsibility business operations (handle() only)
├── Ai/                 # NEW L13 — AI Agents, Tools, Prompts (Laravel AI SDK)
│   └── Agents/
├── Contracts/          # Interfaces / abstractions
├── DTO/                # Data Transfer Objects (readonly classes)
├── Enums/              # PHP 8.1+ Enums
├── Events/             # Domain events
├── Exceptions/         # Custom domain exceptions
├── Http/
│   ├── Controllers/    # Thin — delegate to Actions only
│   ├── Middleware/     # HTTP middleware
│   ├── Requests/       # Form Request validation
│   └── Resources/      # API Resources (JSON:API in L13)
├── Jobs/               # Queue jobs
├── Listeners/          # Event listeners
├── Models/             # Eloquent models
├── Observers/          # Model observers
├── Pipelines/          # Pipeline pipe classes
├── Policies/           # Authorization policies
├── Providers/          # Service providers
├── Repositories/       # Data access layer
├── Services/           # Complex multi-step orchestration
└── ValueObjects/       # Immutable domain value objects

bootstrap/
└── app.php             # ← ALL middleware, routing, exception config lives here (Kernel.php is gone)
```

### Layer Responsibilities

```
RULE A-01: Controllers  → receive input, call ONE Action or Service, return response. Zero logic.
RULE A-02: Actions      → one public handle() method, one responsibility, injectable deps.
RULE A-03: Services     → orchestrate multiple Actions or external APIs. No HTTP dependencies.
RULE A-04: Repositories → all Eloquent queries. Implements interface. No business logic.
RULE A-05: Models       → relationships, casts, mutators, scopes. Nothing else.
RULE A-06: AI Agents    → extend Agent from Laravel AI SDK. Tools injected via DI.
```

---

## 3. PHP ATTRIBUTE-BASED CONFIGURATION — NEW IN L13

> Laravel 13 expands first-party PHP Attribute support across 15+ locations in the framework.
> PHP Attributes themselves are a PHP 8.0 language feature; what is NEW in L13 is Laravel's
> first-party use of them as a replacement for class-property-based configuration.
> Attributes are OPTIONAL and fully backward compatible with property-based config.
> Prefer attributes for new code — they co-locate config with the class it configures.
>
> ⚠️ NAMESPACE NOTE: Always verify attribute class import paths against your installed
> vendor/laravel/framework/src before using. The canonical paths are shown below.

### Rules

```
RULE ATTR-01: Use #[Middleware] on controller class for class-wide middleware.
RULE ATTR-02: Use #[Middleware] on individual methods for method-specific middleware.
RULE ATTR-03: Use #[Authorize] on controller methods instead of $this->authorize() calls.
RULE ATTR-04: Use #[Tries], #[Backoff], #[Timeout], #[FailOnTimeout] on Job and Listener classes.
              NOTE: These queue attributes existed before L13 but are now the preferred style.
              Do NOT mix attribute-style and property-style on the same class.
RULE ATTR-05: Use #[Table], #[FillableColumns], #[Hidden] etc. on Model classes.
RULE ATTR-06: Do NOT mix attribute-style and property-style config on the same class.
RULE ATTR-07: Attributes on Models replace: $table, $primaryKey, $fillable, $hidden, $casts.
```

### Implementation

```php
// CONTROLLERS — middleware and authorization via attributes
use Illuminate\Routing\Attributes\Middleware;
use Illuminate\Routing\Attributes\Authorize;

#[Middleware('auth')]                    // applies to ALL methods
#[Middleware('verified')]
class PostController extends Controller
{
    // Only this method also requires 'subscribed' + policy check
    #[Middleware('subscribed')]
    #[Authorize('create', Post::class)]
    public function store(CreatePostRequest $request, CreatePost $action): JsonResponse
    {
        $post = $action->handle(CreatePostDTO::fromRequest($request));
        return response()->json(new PostResource($post), 201);
    }

    #[Authorize('update', 'post')]       // 'post' = route model binding param name
    public function update(UpdatePostRequest $request, Post $post, UpdatePost $action): JsonResponse
    {
        return response()->json(new PostResource($action->handle($post, $request->validated())));
    }

    #[Authorize('delete', 'post')]
    public function destroy(Post $post, DeletePost $action): JsonResponse
    {
        $action->handle($post);
        return response()->json(null, 204);
    }
}

// MODELS — declarative attribute-based config
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\FillableColumns;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[Table('blog_posts', key: 'post_id')]
#[FillableColumns(['title', 'body', 'slug', 'status', 'user_id'])]
#[Hidden(['deleted_at'])]
#[ObservedBy([PostObserver::class])]
class Post extends Model
{
    // Casts still use the $casts property (no attribute for casts yet in L13)
    protected $casts = [
        'status'       => PostStatus::class,
        'published_at' => 'datetime',
        'metadata'     => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

// JOBS — queue config via attributes (replaces class properties)
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\Attributes\FailOnTimeout;

#[Tries(5)]
#[Backoff([10, 30, 60, 120, 300])]
#[Timeout(120)]
#[FailOnTimeout]
class SyncUserToWarehouse implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private readonly User $user) {}

    public function handle(WarehouseService $warehouse): void
    {
        $warehouse->syncUser($this->user);
    }

    public function failed(Throwable $e): void
    {
        Log::critical('Warehouse sync failed', ['user_id' => $this->user->id]);
    }
}

// LISTENERS — queue config via attributes
#[Tries(3)]
#[Backoff([10, 60, 300])]
class SendOrderConfirmation implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderPlaced $event): void
    {
        Mail::to($event->order->user->email)->send(new OrderConfirmationMail($event->order));
    }
}

// FORM REQUESTS — declarative redirect and stop-on-first-failure
use Illuminate\Foundation\Http\Attributes\RedirectTo;
use Illuminate\Foundation\Http\Attributes\StopOnFirstFailure;

#[RedirectTo('/checkout')]
#[StopOnFirstFailure]
class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'items'                  => ['required', 'array', 'min:1'],
            'items.*.product_id'     => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'       => ['required', 'integer', 'min:1'],
            'shipping_address'       => ['required', 'string'],
            'payment_method'         => ['required', Rule::enum(PaymentMethod::class)],
        ];
    }
}
```

---

## 4. SERVICE CONTAINER & DEPENDENCY INJECTION

### Rules

```
RULE DI-01: Bind interfaces to implementations in ServiceProviders, never inline.
RULE DI-02: Use contextual binding when the same interface needs different implementations per class.
RULE DI-03: Use scoped() for per-request singletons (current tenant, current user context).
RULE DI-04: Use singleton() only for stateless services (HTTP clients, config readers).
RULE DI-05: Tag related implementations and resolve them as a group.
RULE DI-06: Never resolve via app()->make() in business logic — always constructor-inject.
```

### Implementation

```php
// In a ServiceProvider::register()

// Basic interface binding
$this->app->bind(PaymentGatewayInterface::class, StripeGateway::class);

// Singleton — one instance for the entire app lifecycle
$this->app->singleton(CurrencyConverter::class, function ($app) {
    return new CurrencyConverter(config('services.currency.api_key'));
});

// Scoped — new instance per HTTP request / queue job
$this->app->scoped(CurrentTenant::class, function () {
    return new CurrentTenant(request()->header('X-Tenant-ID'));
});

// Contextual — same interface, different concrete class per consumer
$this->app->when(PhotoController::class)
    ->needs(StorageInterface::class)
    ->give(fn() => Storage::disk('photos'));

$this->app->when(DocumentController::class)
    ->needs(StorageInterface::class)
    ->give(fn() => Storage::disk('documents'));

// Tagged — group of implementations resolved together
$this->app->tag([StripeGateway::class, PayPalGateway::class], 'payment-gateways');
$this->app->bind(PaymentRouter::class, function ($app) {
    return new PaymentRouter($app->tagged('payment-gateways'));
});
```

---

## 5. ACTION PATTERN

### Rules

```
RULE ACT-01: One Action = one business operation. Only ONE public method: handle().
RULE ACT-02: Method signature: public function handle(DTO $dto): Model|DTO|void
RULE ACT-03: Actions are resolved via DI — all dependencies injected in constructor.
RULE ACT-04: Actions can call Repositories, Services, dispatch Events, send Notifications.
RULE ACT-05: Actions cannot access Request, Response, or Session directly.
RULE ACT-06: Actions are the ONLY layer that wraps multi-model writes in DB::transaction().
RULE ACT-07: Reuse the same Action in Controllers, Jobs, Console Commands, and Tests.
RULE ACT-08: Prefer readonly classes for Actions (design recommendation — not a framework
             constraint). Use a non-readonly class only when the Action genuinely needs
             mutable internal state across method calls.
```

### Implementation

```php
// app/Actions/Orders/CreateOrder.php
namespace App\Actions\Orders;

readonly class CreateOrder
{
    public function __construct(
        private OrderRepositoryInterface $orders,
        private InventoryService         $inventory,
        private PaymentService           $payment,
    ) {}

    public function handle(CreateOrderDTO $dto): Order
    {
        // Guard: business validation before touching DB
        $this->inventory->ensureAvailable($dto->items);

        $order = DB::transaction(function () use ($dto) {
            $order = $this->orders->create($dto);
            $this->inventory->reserve($order);
            $this->payment->charge($order, $dto->paymentMethod);
            return $order;
        });

        // Event fires AFTER commit (ShouldDispatchAfterCommit on the event)
        OrderPlaced::dispatch($order);

        return $order;
    }
}

// Controller — thin, uses #[Authorize] attribute + delegates immediately
#[Middleware('auth')]
class OrderController extends Controller
{
    public function store(CreateOrderRequest $request, CreateOrder $action): JsonResponse
    {
        $order = $action->handle(CreateOrderDTO::fromRequest($request));
        return response()->json(new OrderResource($order), 201);
    }
}

// Job — reuses same Action, no duplication
class ProcessScheduledOrder implements ShouldQueue
{
    public function __construct(private readonly Order $order) {}

    public function handle(CreateOrder $action): void
    {
        $action->handle(CreateOrderDTO::fromOrder($this->order));
    }
}
```

---

## 6. DATA TRANSFER OBJECTS

### Rules

```
RULE DTO-01: Always use readonly classes. Data is immutable after construction.
RULE DTO-02: Provide named constructors: fromRequest(), fromModel(), fromArray().
RULE DTO-03: DTOs carry VALIDATED data only. Never pass raw request arrays to Actions.
RULE DTO-04: Use strict types. No mixed, no untyped properties.
RULE DTO-05: Use PHP Enums as DTO property types for all fixed-state fields.
RULE DTO-06: Nest DTOs for complex structures (OrderDTO contains Collection<OrderItemDTO>).
RULE DTO-07: DTOs have zero side effects — no DB calls, no HTTP calls.
```

### Implementation

```php
// app/DTO/CreateOrderDTO.php
namespace App\DTO;

readonly class CreateOrderDTO
{
    public function __construct(
        public int           $userId,
        public string        $shippingAddress,
        public PaymentMethod $paymentMethod,
        public Collection    $items,           // Collection<OrderItemDTO>
        public ?string       $couponCode = null,
    ) {}

    public static function fromRequest(CreateOrderRequest $request): self
    {
        return new self(
            userId:          $request->user()->id,
            shippingAddress: $request->validated('shipping_address'),
            paymentMethod:   PaymentMethod::from($request->validated('payment_method')),
            items:           collect($request->validated('items'))
                                 ->map(fn($i) => OrderItemDTO::fromArray($i)),
            couponCode:      $request->validated('coupon_code'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            userId:          $data['user_id'],
            shippingAddress: $data['shipping_address'],
            paymentMethod:   PaymentMethod::from($data['payment_method']),
            items:           collect($data['items'])->map(fn($i) => OrderItemDTO::fromArray($i)),
            couponCode:      $data['coupon_code'] ?? null,
        );
    }
}

// app/Enums/PaymentMethod.php
enum PaymentMethod: string
{
    case CARD   = 'card';
    case CASH   = 'cash';
    case WALLET = 'wallet';

    public function label(): string
    {
        return match($this) {
            self::CARD   => 'Credit / Debit Card',
            self::CASH   => 'Cash on Delivery',
            self::WALLET => 'Digital Wallet',
        };
    }
}

// app/Enums/OrderStatus.php  — typed class constants (PHP 8.3 feature)
enum OrderStatus: string
{
    case PENDING    = 'pending';
    case PROCESSING = 'processing';
    case SHIPPED    = 'shipped';
    case DELIVERED  = 'delivered';
    case CANCELLED  = 'cancelled';

    // PHP 8.3 typed constants
    const array ACTIVE_STATUSES = [self::PENDING, self::PROCESSING, self::SHIPPED];

    public function isTerminal(): bool
    {
        return in_array($this, [self::DELIVERED, self::CANCELLED]);
    }
}
```

---

## 7. REPOSITORY PATTERN

### Rules

```
RULE REPO-01: Every repository implements an interface defined in app/Contracts/.
RULE REPO-02: Only Eloquent queries in repositories — no business logic, no events.
RULE REPO-03: Always return typed values: Model, Collection, LengthAwarePaginator, bool, void.
RULE REPO-04: Bind interface → implementation in a ServiceProvider.
RULE REPO-05: Swap Eloquent implementation with an in-memory fake in tests.
RULE REPO-06: Query filters use when() chains — never conditional if/else query building.
RULE REPO-07: Never expose raw Query Builder outside the repository boundary.
```

### Implementation

```php
// app/Contracts/Repositories/OrderRepositoryInterface.php
interface OrderRepositoryInterface
{
    public function find(int $id): ?Order;
    public function findOrFail(int $id): Order;
    public function create(CreateOrderDTO $dto): Order;
    public function update(Order $order, array $data): Order;
    public function delete(Order $order): bool;
    public function getPaginated(array $filters = []): LengthAwarePaginator;
}

// app/Repositories/EloquentOrderRepository.php
class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function getPaginated(array $filters = []): LengthAwarePaginator
    {
        return Order::query()
            ->with(['user', 'items.product'])
            ->when($filters['status']  ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($filters['user_id'] ?? null, fn($q, $v) => $q->where('user_id', $v))
            ->when($filters['from']    ?? null, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['to']      ?? null, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($filters['search']  ?? null, fn($q, $v) => $q->where('order_number', 'like', "%{$v}%"))
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    public function create(CreateOrderDTO $dto): Order
    {
        $order = Order::create([
            'user_id'          => $dto->userId,
            'shipping_address' => $dto->shippingAddress,
            'payment_method'   => $dto->paymentMethod,
            'status'           => OrderStatus::PENDING,
        ]);

        $order->items()->createMany(
            $dto->items->map(fn($item) => [
                'product_id' => $item->productId,
                'quantity'   => $item->quantity,
                'unit_price' => $item->unitPrice,
            ])->all()
        );

        return $order->load('items');
    }
}

// Bind in RepositoryServiceProvider::register()
$this->app->bind(OrderRepositoryInterface::class, EloquentOrderRepository::class);
```

---

## 8. PIPELINE PATTERN

### Rules

```
RULE PIPE-01: Use Laravel's built-in Pipeline for sequential multi-step processing workflows.
RULE PIPE-02: Each pipe receives the payload and a $next Closure — MUST call $next($payload).
RULE PIPE-03: Short-circuit by throwing an exception instead of calling $next().
RULE PIPE-04: Pipes must be single-responsibility — one transformation per class.
RULE PIPE-05: Use Pipelines for: import validation, checkout flows, data transformation chains.
```

### Implementation

```php
// Each pipe is a single-responsibility class
class ApplyCoupon
{
    public function handle(CheckoutContext $ctx, Closure $next): CheckoutContext
    {
        if ($ctx->couponCode) {
            $coupon = Coupon::active()->whereCode($ctx->couponCode)->firstOrFail();
            $ctx->discount = $coupon->calculateDiscount($ctx->subtotal);
        }
        return $next($ctx);
    }
}

class CalculateTax
{
    public function handle(CheckoutContext $ctx, Closure $next): CheckoutContext
    {
        $ctx->tax = TaxCalculator::forRegion($ctx->shippingAddress->country)
            ->calculate($ctx->subtotal - $ctx->discount);
        return $next($ctx);
    }
}

// Usage in an Action
class ProcessCheckout
{
    public function handle(CheckoutDTO $dto): Order
    {
        $context = CheckoutContext::fromDTO($dto);

        $processed = app(Pipeline::class)
            ->send($context)
            ->through([
                ValidateCartItems::class,
                ApplyCoupon::class,
                CalculateTax::class,
                ReserveInventory::class,
                ChargePayment::class,
            ])
            ->thenReturn();

        return Order::createFromContext($processed);
    }
}
```

---

## 9. AUTHORIZATION — POLICIES & GATES

### Rules

```
RULE AUTH-01: Use Policies for Model-based authorization. Never inline Gate checks for model actions.
RULE AUTH-02: Use Gates for non-model permissions (view-dashboard, access-reports).
RULE AUTH-03: Use Response::denyAsNotFound() to return 404 instead of 403 (hide resource existence).
RULE AUTH-04: In L13, prefer #[Authorize] attribute on controller methods over $this->authorize().
RULE AUTH-05: Use Gate::before() ONLY for superadmin bypass.
RULE AUTH-06: Policy methods return bool OR Illuminate\Auth\Access\Response — never strings.
RULE AUTH-07: In Blade, use @can/@cannot — never check roles/permissions directly in templates.
RULE AUTH-08: For route-level protection, use Route::middleware('can:action,model').
RULE AUTH-09: Custom policy methods (publish, approve, feature) are preferred over boolean flags.
```

### Implementation

```php
// app/Policies/PostPolicy.php
class PostPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can list
    }

    public function view(User $user, Post $post): Response
    {
        return $user->id === $post->user_id
            ? Response::allow()
            : Response::denyAsNotFound(); // 404 — hides the resource existence
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['writer', 'admin']);
    }

    public function update(User $user, Post $post): Response
    {
        return $user->id === $post->user_id
            ? Response::allow()
            : Response::deny('You do not own this post.');
    }

    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id || $user->isAdmin();
    }

    // Custom method — business-rule-specific authorization
    public function publish(User $user, Post $post): Response
    {
        if ($user->id !== $post->user_id) {
            return Response::deny('You do not own this post.');
        }
        if ($post->status !== PostStatus::DRAFT) {
            return Response::deny('Only draft posts can be published.');
        }
        return Response::allow();
    }
}

// AuthServiceProvider::boot()
Gate::before(function (User $user) {
    if ($user->isSuperAdmin()) return true;
    if ($user->isBanned())     return false;
});

Gate::define('view-dashboard',   fn(User $user) => $user->hasRole(['admin', 'manager']));
Gate::define('access-analytics', fn(User $user) => $user->hasRole('analyst') && $user->isActive());

// L13 preferred: attribute on controller
#[Middleware('auth')]
class PostController extends Controller
{
    #[Authorize('publish', 'post')]
    public function publish(Post $post, PublishPost $action): JsonResponse
    {
        return response()->json(new PostResource($action->handle($post)));
    }
}

// Blade
@can('update', $post)  <a href="{{ route('posts.edit', $post) }}">Edit</a>  @endcan
@can('publish', $post) <button>Publish</button>                             @endcan
```

---

## 10. AUTHORIZATION — RBAC / ABAC / ReBAC / PBAC

### Rules

```
RULE RBAC-01: Store roles and permissions in DB. Use a pivot table (role_user, permission_role).
RULE RBAC-02: Cache user roles per request using once(). Never query DB per policy check.
              NOTE: once() was introduced in Laravel 10 — it is available in L11/12/13.
RULE ABAC-03: ABAC evaluates user attributes (clearance), resource attributes (classification),
              and environment (time, IP). All three can block access.
RULE ReBAC-04: Use exists() for relationship checks in policies. Never load full collections.
RULE PBAC-05: PBAC uses a PolicyEngine that chains multiple atomic Policy objects.
RULE PBAC-06: Cache PolicyEngine results per request using a hash key (30-60 seconds).
```

### RBAC Implementation

```php
class User extends Authenticatable
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function hasRole(string|array $roles): bool
    {
        return $this->cachedRoles()->intersect((array) $roles)->isNotEmpty();
    }

    public function hasPermission(string $permission): bool
    {
        return $this->cachedPermissions()->contains($permission);
    }

    public function isAdmin(): bool { return $this->hasRole('admin'); }

    // once() memoizes for the current request — prevents N+1 on policy checks
    // Available since Laravel 10, fully supported in L13
    private function cachedRoles(): Collection
    {
        return once(fn() => $this->roles->pluck('name'));
    }

    private function cachedPermissions(): Collection
    {
        return once(fn() => $this->roles->flatMap->permissions->pluck('name'));
    }
}
```

### ABAC Implementation

```php
class DocumentPolicy
{
    public function view(User $user, Document $document): bool
    {
        if ($user->id === $document->owner_id) return true;
        if ($document->sharedWith()->where('user_id', $user->id)->exists()) return true;

        // Clearance level check
        $levels = ['public' => 1, 'internal' => 2, 'confidential' => 3, 'secret' => 4];
        if (($levels[$user->clearance_level] ?? 0) < ($levels[$document->classification] ?? 4)) {
            return false;
        }

        // Time window check
        if ($document->access_from && now()->isBefore($document->access_from))   return false;
        if ($document->access_until && now()->isAfter($document->access_until))  return false;

        // Network check
        if ($document->requires_secure_network && !$this->isSecureNetwork()) return false;

        return $user->hasPermission('view-documents');
    }

    private function isSecureNetwork(): bool
    {
        return in_array(request()->ip(), config('security.office_ips'))
            || request()->header('X-VPN-Connected') === 'true';
    }
}
```

---

## 11. EVENTS, LISTENERS & SUBSCRIBERS

### Rules

```
RULE EVT-01: Events are immutable data containers — no logic, no DB calls, no HTTP calls.
RULE EVT-02: Always use SerializesModels on events that hold Eloquent models.
RULE EVT-03: Always use ShouldDispatchAfterCommit on events dispatched inside transactions.
RULE EVT-04: Slow listeners (email, API, notification) MUST implement ShouldQueue.
RULE EVT-05: Use #[Tries], #[Backoff], #[Timeout] attributes on queued listeners.
RULE EVT-06: Always implement failed() on queued listeners for final failure handling.
RULE EVT-07: Use EventSubscribers to group all listeners for the same domain.
RULE EVT-08: Return false from a listener to STOP propagation to subsequent listeners.
RULE EVT-09: NEVER dispatch events from inside Observers (double-fire risk). Pick ONE.
```

### Implementation

```php
// app/Events/OrderPlaced.php
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class OrderPlaced implements ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly array $metadata = [],
    ) {}
}

// app/Listeners/SendOrderConfirmation.php — L13 attribute style
#[Tries(5)]
#[Backoff([10, 30, 60, 120, 300])]
#[Timeout(60)]
class SendOrderConfirmation implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderPlaced $event): void
    {
        Mail::to($event->order->user->email)
            ->send(new OrderConfirmationMail($event->order));
    }

    public function failed(OrderPlaced $event, Throwable $e): void
    {
        Log::error('Order confirmation failed', [
            'order_id' => $event->order->id,
            'error'    => $e->getMessage(),
        ]);
        Notification::route('mail', config('mail.admin'))
            ->notify(new OrderEmailFailedNotification($event->order));
    }
}

// EventSubscriber — domain grouping
class OrderEventSubscriber
{
    public function onOrderPlaced(OrderPlaced $event): void
    {
        Log::info('Order placed', ['order_id' => $event->order->id]);
    }

    public function onOrderShipped(OrderShipped $event): void
    {
        Notification::send($event->order->user, new OrderShippedNotification($event->order));
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(OrderPlaced::class,  [self::class, 'onOrderPlaced']);
        $events->listen(OrderShipped::class, [self::class, 'onOrderShipped']);
    }
}

// EventServiceProvider
protected $subscribe = [OrderEventSubscriber::class];
```

---

## 12. ELOQUENT OBSERVERS

### Rules

```
RULE OBS-01: Observers handle MODEL LIFECYCLE side effects — not domain event reactions.
RULE OBS-02: Use creating() to set defaults and normalize data BEFORE insert.
RULE OBS-03: Use created() for related model creation that requires the parent to exist first.
RULE OBS-04: Use updating() to detect dirty fields and react accordingly.
RULE OBS-05: Use updated() for audit logging and external sync triggers.
RULE OBS-06: NEVER dispatch domain Events from inside Observers.
RULE OBS-07: Implement ShouldHandleEventsAfterCommit to run after the DB transaction commits.
RULE OBS-08: In L13, register observers with the #[ObservedBy] attribute on the Model class.
RULE OBS-09: Skip observer for bulk ops: Model::withoutObservers(fn() => ...);
```

### Implementation

```php
// app/Observers/UserObserver.php
class UserObserver implements ShouldHandleEventsAfterCommit
{
    public function creating(User $user): void
    {
        $user->email    = Str::lower($user->email);
        $user->username ??= Str::slug($user->name) . '_' . Str::random(4);
    }

    public function created(User $user): void
    {
        $user->profile()->create(['bio' => '']);
        $user->settings()->create(UserSettings::defaults());
    }

    public function updating(User $user): void
    {
        if ($user->isDirty('email'))    $user->email_verified_at = null;
        if ($user->isDirty('password')) $user->password_changed_at = now();
    }

    public function updated(User $user): void
    {
        if ($user->wasChanged(['name', 'email', 'role'])) {
            AuditLog::record('user_updated', $user->id, $user->getChanges());
        }
    }

    public function deleting(User $user): void
    {
        if ($user->hasActiveSubscription()) {
            throw new CannotDeleteUserException('User has an active subscription.');
        }
    }

    public function deleted(User $user): void
    {
        $user->posts()->delete();
        Storage::delete("avatars/{$user->id}");
    }
}

// Model — L13 attribute registration
// Also available: User::withoutObservers(fn() => User::factory()->create());
```

---

## 13. ADVANCED ELOQUENT

### Rules

```
RULE ELQ-01: Always eager load with() in controllers — never load in loops or views.
RULE ELQ-02: Use addSelect() subqueries instead of loading whole relationships for single values.
RULE ELQ-03: Use cursorPaginate() for large datasets (more efficient than paginate() on big tables).
RULE ELQ-04: Use lazyById() for processing millions of rows — prevents memory exhaustion.
RULE ELQ-05: Use upsert() for bulk insert-or-update in a single query.
RULE ELQ-06: Use withCount(), withSum(), withAvg() instead of loading and counting in PHP.
RULE ELQ-07: JSON column queries: -> syntax, whereJsonContains(), whereJsonLength().
RULE ELQ-08: Use Global Scopes for tenant isolation, soft deletes, active-only filtering.
RULE ELQ-09: Use Local Scopes for reusable query fragments: scopeActive(), scopePublished().
RULE ELQ-10: Use selectRaw() with window functions for ranking and running totals.
RULE ELQ-11: NEW L13 — Prepared statement caching is ON by default. Do NOT disable it unless
             you have a specific reason (e.g. dynamic SQL with many unique structures). The
             default improves performance on repeated queries with bound parameters.
```

### Implementation

```php
// Subquery — avoids loading entire relationship for a single value
$users = User::addSelect([
    'last_order_total' => Order::select('total')
        ->whereColumn('user_id', 'users.id')
        ->latest()->limit(1),
])
->withCount('orders')
->withSum('orders', 'total')
->paginate(20);

// Cursor pagination — efficient for large, ordered tables
$orders = Order::orderBy('id')->cursorPaginate(50);

// Lazy — process 1M+ rows without memory crash
Order::whereYear('created_at', now()->year)
    ->lazyById(500)
    ->each(fn(Order $order) => ProcessOrderReport::dispatch($order));

// Upsert — one query for bulk sync
Product::upsert(
    $productsFromAPI,
    uniqueBy: ['sku'],
    update:   ['name', 'price', 'stock', 'updated_at'],
);

// JSON column queries
User::where('preferences->theme', 'dark')->get();
User::whereJsonContains('roles', 'moderator')->get();
User::whereJsonLength('tags', '>', 5)->get();

// Window functions
$ranked = DB::table('orders')
    ->select([
        '*',
        DB::raw('RANK() OVER (PARTITION BY user_id ORDER BY total DESC) as rank'),
        DB::raw('SUM(total) OVER (PARTITION BY user_id) as running_total'),
    ])
    ->get();

// Global Scope
class ActiveScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('is_active', true);
    }
}

// Local Scopes — chainable
class Post extends Model
{
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', PostStatus::PUBLISHED)->whereNotNull('published_at');
    }

    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}

// Chained
Post::published()->recent()->with('author')->paginate(15);
```

---

## 14. CUSTOM ELOQUENT CASTS & VALUE OBJECTS

### Rules

```
RULE CAST-01: Use Custom Casts for non-scalar column values (Money, Address, Range).
RULE CAST-02: Value Objects are immutable — always readonly classes.
RULE CAST-03: Use Laravel's encrypt()/decrypt() in casts for sensitive columns.
RULE CAST-04: PHP 8.1+ Enum Casts are native — 'status' => OrderStatus::class. No custom cast needed.
RULE CAST-05: AsCollection cast for JSON arrays you want as Collections automatically.
RULE CAST-06: Never JSON encode/decode manually in models — always use a cast.
```

### Implementation

```php
// Value Object — immutable
readonly class Money
{
    public function __construct(
        public readonly int    $amount,   // in cents
        public readonly string $currency,
    ) {}

    public function formatted(): string
    {
        return number_format($this->amount / 100, 2) . ' ' . $this->currency;
    }

    public function add(Money $other): self
    {
        return new self($this->amount + $other->amount, $this->currency);
    }
}

// Custom Cast
class MoneyCast implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): Money
    {
        return new Money((int) $value, $attributes['currency'] ?? 'USD');
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): array
    {
        return $value instanceof Money
            ? [$key => $value->amount, 'currency' => $value->currency]
            : [$key => $value];
    }
}

// Encrypted cast for sensitive JSON data
class EncryptedArrayCast implements CastsAttributes
{
    public function get($model, $key, $value, $attributes): array
    {
        return $value ? json_decode(decrypt($value), true) : [];
    }

    public function set($model, $key, $value, $attributes): string
    {
        return encrypt(json_encode($value));
    }
}

// Model
#[FillableColumns(['user_id', 'total', 'currency', 'status', 'payment_method', 'metadata'])]
class Order extends Model
{
    protected $casts = [
        'total'          => MoneyCast::class,
        'status'         => OrderStatus::class,   // Native Enum cast
        'payment_method' => PaymentMethod::class, // Native Enum cast
        'metadata'       => EncryptedArrayCast::class,
        'tags'           => AsCollection::class,
        'shipped_at'     => 'datetime',
    ];
}
```

---

## 15. JOBS, QUEUES & BATCHING

> NOTE: Bus::batch() has been available since Laravel 8. Queue attributes (#[Tries] etc.)
> predate L13 but are now the PREFERRED style over class properties. Do not mix the two
> approaches on the same class (RULE ATTR-06).

### Rules

```
RULE JOB-01: Use #[Tries], #[Backoff], #[Timeout], #[FailOnTimeout] attributes — not class props.
RULE JOB-02: Always implement failed() for final failure logging and alerting.
RULE JOB-03: Use ShouldBeUnique for jobs that must not run concurrently per resource.
RULE JOB-04: Use WithoutOverlapping middleware to prevent concurrent execution.
RULE JOB-05: Use Bus::batch() for parallel jobs with collective callbacks.
RULE JOB-06: Use allowFailures() on batches to continue despite individual failures.
RULE JOB-07: Use $this->fail($exception) to immediately mark failed without retry.
RULE JOB-08: Never put business logic in the Job — delegate to an Action or Service.
RULE JOB-09: In L13, use Queue::route() in a ServiceProvider to centralize queue assignment.
```

### Implementation

```php
// Job with attribute-based config
#[Tries(5)]
#[Backoff([10, 30, 60, 120, 300])]
#[Timeout(120)]
#[FailOnTimeout]
class SyncUserToWarehouse implements ShouldQueue, ShouldBeUnique
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public int $uniqueFor = 3600;

    public function __construct(private readonly User $user) {}

    public function uniqueId(): string
    {
        return "sync-user-{$this->user->id}";
    }

    public function middleware(): array
    {
        return [new WithoutOverlapping($this->user->id)];
    }

    public function handle(WarehouseService $warehouse): void
    {
        try {
            $warehouse->syncUser($this->user);
        } catch (WarehouseUnavailableException $e) {
            throw $e; // Retries with backoff
        } catch (InvalidUserDataException $e) {
            $this->fail($e); // No retry — bad data
        }
    }

    public function failed(Throwable $e): void
    {
        Log::critical('Warehouse sync failed', ['user_id' => $this->user->id]);
    }
}

// Batch — parallel jobs with collective lifecycle
class ProcessMonthlyReports
{
    public function handle(): void
    {
        $jobs = User::active()->get()
            ->map(fn(User $user) => new GenerateUserReportJob($user));

        Bus::batch($jobs->all())
            ->then(fn(Batch $b) => Log::info("All {$b->totalJobs} reports done."))
            ->catch(fn(Batch $b, Throwable $e) => Log::error('Batch failed', ['err' => $e->getMessage()]))
            ->finally(fn(Batch $b) => Cache::forget('reports:processing'))
            ->allowFailures()
            ->onQueue('reports')
            ->dispatch();
    }
}
```

---

## 16. QUEUE ROUTING — NEW IN L13

> `Queue::route()` centralizes queue/connection assignment in one ServiceProvider.
> Removes scattered `->onQueue()` and `->onConnection()` calls across the codebase.

### Rules

```
RULE QR-01: Define ALL queue routing in a dedicated QueueServiceProvider or AppServiceProvider.
RULE QR-02: Never set ->onQueue() / ->onConnection() at dispatch sites — use Queue::route().
RULE QR-03: Exception: dispatch-time queue overrides are still allowed for one-off emergency routing.
RULE QR-04: Group jobs by domain (payments on 'payments' queue, emails on 'notifications' queue).
```

### Implementation

```php
// app/Providers/QueueServiceProvider.php
namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;

class QueueServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Centralized routing — one place to change queue topology
        Queue::route(ProcessPaymentJob::class,    connection: 'redis', queue: 'payments');
        Queue::route(RefundPaymentJob::class,      connection: 'redis', queue: 'payments');
        Queue::route(SendOrderConfirmation::class, connection: 'redis', queue: 'notifications');
        Queue::route(SendWelcomeEmail::class,      connection: 'redis', queue: 'notifications');
        Queue::route(SyncUserToWarehouse::class,   connection: 'redis', queue: 'warehouse');
        Queue::route(GenerateUserReportJob::class, connection: 'redis', queue: 'reports');
        Queue::route(SyncInventoryJob::class,      connection: 'sqs',  queue: 'inventory');
    }
}

// Dispatching — NO onQueue() needed anymore
ProcessPaymentJob::dispatch($order);    // Automatically goes to 'payments' queue on redis
SendWelcomeEmail::dispatch($user);      // Automatically goes to 'notifications' queue on redis

// Register in bootstrap/app.php (NOT config/app.php providers array in L13 bootstrap style)
// Or add to config/app.php 'providers' depending on your bootstrap setup
```

---

## 17. ADVANCED CACHING — UPDATED IN L13

### Rules

```
RULE CACHE-01: Use Cache::remember() for expensive queries. Always set a TTL.
RULE CACHE-02: Use Cache::tags() (Redis/Memcached) for grouped invalidation by model type.
RULE CACHE-03: Use Cache::lock() to prevent dogpile/thundering-herd on cold cache.
RULE CACHE-04: NEW L13 — Use Cache::touch($key, $ttl) to extend TTL without re-fetching value.
RULE CACHE-05: Always namespace keys: model:id:attribute (e.g., user:42:permissions).
RULE CACHE-06: Invalidate cache in the Observer (updated/deleted) or after Action completes.
RULE CACHE-07: Never cache Request or Auth data — cache only computed/derived data.
```

### Implementation

```php
// Basic remember
public function getUserPermissions(int $userId): Collection
{
    return Cache::remember(
        "user:{$userId}:permissions",
        now()->addHour(),
        fn() => User::find($userId)->roles->flatMap->permissions->pluck('name')
    );
}

// Cache Tags — grouped invalidation
public function getPostsByCategory(int $categoryId): Collection
{
    return Cache::tags(['posts', "category:{$categoryId}"])
        ->remember("posts:category:{$categoryId}", now()->addMinutes(30), function () use ($categoryId) {
            return Post::published()->where('category_id', $categoryId)->with('author')->get();
        });
}

class PostObserver
{
    public function updated(Post $post): void
    {
        Cache::tags(['posts', "category:{$post->category_id}"])->flush();
    }
}

// Lock — prevent dogpile
public function getExpensiveReport(int $userId): array
{
    $key  = "report:user:{$userId}";
    $lock = Cache::lock("lock:{$key}", 30);

    return Cache::remember($key, now()->addHour(), function () use ($lock, $userId) {
        $lock->block(10);
        try {
            return ReportGenerator::forUser($userId)->generate();
        } finally {
            $lock->forceRelease();
        }
    });
}

// NEW L13: Cache::touch() — extend TTL without fetching or re-storing the value
// Useful for keeping actively-used "warm" cache items alive
public function touchUserSessionCache(int $userId): void
{
    Cache::touch("user:{$userId}:session_data", now()->addHour());
}

// Key versioning — bulk invalidation without tags
public function getUserCacheKey(int $userId): string
{
    $version = Cache::get("user:{$userId}:version", 1);
    return "user:{$userId}:v{$version}:data";
}

public function invalidateAllUserCache(int $userId): void
{
    Cache::increment("user:{$userId}:version"); // All old keys are now stale
}
```

---

## 18. JSON:API RESOURCES — NEW IN L13

> Laravel 13 includes first-party JSON:API spec support.
> Use for public APIs that must comply with the JSON:API specification.

### Rules

```
RULE JAPI-01: Use JsonApiResource instead of JsonResource when the API must be JSON:API compliant.
RULE JAPI-02: JSON:API handles serialization, relationship inclusion, sparse fieldsets automatically.
RULE JAPI-03: For internal APIs and simple endpoints, standard JsonResource is still preferred.
RULE JAPI-04: Never manually build JSON:API response envelopes — always use the provided classes.
```

### Implementation

```php
// app/Http/Resources/PostJsonApiResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonApiResource;

class PostJsonApiResource extends JsonApiResource
{
    public function toAttributes($request): array
    {
        return [
            'title'        => $this->title,
            'body'         => $this->body,
            'slug'         => $this->slug,
            'status'       => $this->status->value,
            'published_at' => $this->published_at?->toISOString(),
            'created_at'   => $this->created_at->toISOString(),
        ];
    }

    public function toRelationships($request): array
    {
        return [
            'author'   => UserJsonApiResource::make($this->whenLoaded('user')),
            'comments' => CommentJsonApiResource::collection($this->whenLoaded('comments')),
        ];
    }

    public function toLinks($request): array
    {
        return [
            'self' => route('api.posts.show', $this->id),
        ];
    }
}

// Controller returns
public function show(Post $post): JsonApiResource
{
    $post->load(['user', 'comments']);
    return PostJsonApiResource::make($post);
}

// Response auto-includes JSON:API compliant headers and envelope:
// {
//   "data": {
//     "type": "posts",
//     "id": "1",
//     "attributes": { ... },
//     "relationships": { ... },
//     "links": { ... }
//   }
// }
```

---

## 19. SEMANTIC & VECTOR SEARCH — NEW IN L13

> Native vector similarity search in the query builder via PostgreSQL + pgvector.
> Use the AI SDK to generate embeddings, store them, and query by similarity.

### Rules

```
RULE VEC-01: Store embeddings as vector columns (PostgreSQL + pgvector extension required).
RULE VEC-02: Generate embeddings via Str::of($text)->toEmbeddings() (Laravel AI SDK).
RULE VEC-03: Use whereVectorSimilarTo() for semantic similarity queries.
RULE VEC-04: Always index vector columns — full-table similarity scans are extremely slow.
RULE VEC-05: Cache embeddings for static content — re-generating is expensive.
RULE VEC-06: Use vector search for: semantic document search, product recommendation, duplicate detection.
RULE VEC-07: Combine vector search with traditional filters (where status = 'published' AND vector sim).
```

### Implementation

```php
// Migration — requires pgvector extension
Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->vector('embedding', 1536);  // 1536 dims for OpenAI text-embedding-3-small
    $table->timestamps();
});

// Generate and store embedding when document is created/updated
class DocumentObserver
{
    public function creating(Document $document): void
    {
        $document->embedding = Str::of($document->title . ' ' . $document->body)
            ->toEmbeddings();
    }

    public function updating(Document $document): void
    {
        if ($document->isDirty(['title', 'body'])) {
            $document->embedding = Str::of($document->title . ' ' . $document->body)
                ->toEmbeddings();
        }
    }
}

// Semantic search query
class DocumentSearchService
{
    public function search(string $query, int $limit = 10): Collection
    {
        return DB::table('documents')
            ->where('status', 'published')              // Traditional filter first
            ->whereVectorSimilarTo('embedding', $query) // Then semantic similarity
            ->limit($limit)
            ->get();
    }

    public function findSimilar(Document $document, int $limit = 5): Collection
    {
        return DB::table('documents')
            ->whereVectorSimilarTo('embedding', $document->embedding)
            ->where('id', '!=', $document->id)
            ->limit($limit)
            ->get();
    }
}

// Controller
class DocumentController extends Controller
{
    public function search(Request $request, DocumentSearchService $service): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:3']]);

        $results = $service->search($request->get('q'));
        return response()->json(DocumentResource::collection($results));
    }
}
```

---

## 20. LARAVEL AI SDK — NEW IN L13

> First-party, provider-agnostic AI SDK. Stable as of L13 launch.
> Supports: Anthropic, OpenAI, Google Gemini, with automatic failover.

### Rules

```
RULE AI-01: AI Agents live in app/Ai/Agents/. One Agent per domain concern.
RULE AI-02: Tools used by agents are injected via DI — never instantiated inside the Agent.
RULE AI-03: Always configure provider failover in config/ai.php — never rely on a single provider.
RULE AI-04: Wrap all AI SDK calls in try/catch — handle provider errors gracefully.
RULE AI-05: Queue heavy AI operations (image gen, audio synthesis, large embeddings) as Jobs.
RULE AI-06: Never store raw API responses — always extract and store structured data.
RULE AI-07: Use embeddings for search and similarity — not for storing full AI responses.
RULE AI-08: Test AI features using fake providers — never call real AI APIs in tests.
```

### Implementation

```php
// app/Ai/Agents/SupportAgent.php
namespace App\Ai\Agents;

use Laravel\Ai\Agent;

class SupportAgent extends Agent
{
    protected string $system = 'You are a helpful support agent for our e-commerce platform.
        Be concise, professional, and always ask for an order number if relevant.';

    // Tools available to this agent — injected by DI
    public function tools(): array
    {
        return [
            app(LookupOrderTool::class),
            app(CheckInventoryTool::class),
            app(CreateRefundTool::class),
        ];
    }
}

// Usage in a Controller
class SupportController extends Controller
{
    public function chat(SupportChatRequest $request): JsonResponse
    {
        try {
            $response = SupportAgent::make()
                ->prompt($request->validated('message'));

            return response()->json(['reply' => (string) $response]);

        } catch (\Laravel\Ai\Exceptions\ProviderException $e) {
            Log::error('AI provider error', ['error' => $e->getMessage()]);
            return response()->json(['reply' => 'Service temporarily unavailable.'], 503);
        }
    }
}

// Text generation — one-off, no agent needed
use Laravel\Ai\Facades\Ai;

$summary = Ai::text("Summarize this product description: {$product->description}");

// Image generation — queue this as a Job
#[Tries(3)]
#[Timeout(120)]
class GenerateProductImageJob implements ShouldQueue
{
    public function __construct(private readonly Product $product) {}

    public function handle(): void
    {
        $image = Image::of("Product photo for: {$this->product->name}, clean white background")
            ->generate();

        Storage::put("products/{$this->product->id}/ai-image.png", (string) $image);

        $this->product->update(['ai_image_generated' => true]);
    }
}

// Embeddings for semantic search (integrates with Section 19)
use Illuminate\Support\Str;

$embedding = Str::of($product->name . ' ' . $product->description)->toEmbeddings();
$product->update(['embedding' => $embedding]);

// Audio synthesis
use Laravel\Ai\Audio;

$audio = Audio::of("Your order #{$order->number} has been shipped!")->generate();
Storage::put("notifications/{$order->id}/shipped.mp3", (string) $audio);

// config/ai.php — provider failover
return [
    'default' => 'anthropic',
    'providers' => [
        'anthropic' => ['api_key' => env('ANTHROPIC_API_KEY')],
        'openai'    => ['api_key' => env('OPENAI_API_KEY')],
        'gemini'    => ['api_key' => env('GEMINI_API_KEY')],
    ],
    // On billing/quota errors, automatically failover in order
    'failover' => ['anthropic', 'openai', 'gemini'],
];
```

---

## 21. TYPED CONFIGURATION — NEW IN L13

> Laravel 13 introduces typed config retrieval. Instead of silently coercing types
> (e.g. the string "true" being treated as boolean true), you now declare the expected type
> and Laravel throws a `ConfigTypeMismatchException` at boot if the value does not match.
> This catches an entire class of bugs that previously only surfaced at runtime.

### Rules

```
RULE CFG-01: NEW L13 — Use the typed as: parameter on all config() calls where the type is known.
RULE CFG-02: Accepted types: 'string', 'int', 'float', 'bool', 'array'.
RULE CFG-03: A ConfigTypeMismatchException at boot means a misconfigured .env value — fix the
             env value, not the type declaration.
RULE CFG-04: Apply typed config especially to: boolean feature flags, integer limits/timeouts,
             and float thresholds. These are the values most likely to be silently miscast.
RULE CFG-05: Do NOT use typed config for values that are intentionally nullable or mixed-type —
             use standard config() with a null coalesce instead.
```

### Implementation

```php
// ❌ Before L13 — silent type coercion, bugs hide until runtime
$debug   = config('app.debug');        // Might be string "true" or boolean true
$timeout = config('services.api.timeout'); // Might be "30" (string) or 30 (int)

// ✅ L13 — typed retrieval throws ConfigTypeMismatchException at boot if wrong
$debug   = config('app.debug',             as: 'bool');
$timeout = config('services.api.timeout',  as: 'int');
$apiUrl  = config('services.stripe.url',   as: 'string');
$rate    = config('services.tax.rate',     as: 'float');
$drivers = config('cache.stores',          as: 'array');

// In a ServiceProvider — validate at boot, not at first usage
class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // These will throw ConfigTypeMismatchException immediately if .env is wrong
        // Fail fast at boot — not silently at 3am in production
        $this->validateCriticalConfig();
    }

    private function validateCriticalConfig(): void
    {
        config('app.debug',                    as: 'bool');
        config('queue.default',                as: 'string');
        config('cache.default',                as: 'string');
        config('services.stripe.secret',       as: 'string');
        config('services.api.timeout',         as: 'int');
    }
}

// Practical example — feature flag service
class FeatureFlags
{
    public function isEnabled(string $feature): bool
    {
        return config("features.{$feature}", as: 'bool');
    }
}

// Practical example — rate limiter configuration
class RateLimiterConfig
{
    public function getMaxAttempts(): int
    {
        return config('auth.throttle.max_attempts', as: 'int');
    }

    public function getDecayMinutes(): int
    {
        return config('auth.throttle.decay_minutes', as: 'int');
    }
}
```

---

## 22. PASSKEYS AUTHENTICATION — NEW IN L13

> Laravel 13 adds first-party Passkey support via Laravel Fortify and the new starter kits.
> Passkeys use the WebAuthn standard — no passwords, phishing-resistant, device-bound credentials.

### Rules

```
RULE PK-01: Passkeys are integrated into Laravel Fortify — enable via config, not custom code.
RULE PK-02: Always offer passkeys as an ALTERNATIVE to password auth, not a forced replacement.
RULE PK-03: Passkey registration and authentication use separate dedicated routes — do not merge
            them with standard login/register routes.
RULE PK-04: Store passkey credential data via Fortify's built-in credential model — do NOT
            build a custom credential storage layer.
RULE PK-05: Always validate browser/device support client-side before showing passkey UI.
RULE PK-06: Test passkey flows with Laravel's built-in fake WebAuthn authenticator in tests —
            never require a real hardware key in your test suite.
```

### Implementation

```php
// config/fortify.php — enable passkeys
return [
    'features' => [
        Features::registration(),
        Features::resetPasswords(),
        Features::emailVerification(),
        Features::updateProfileInformation(),
        Features::updatePasswords(),
        Features::twoFactorAuthentication(),
        Features::passkeys(),                 // NEW L13 — enable passkey support
    ],
];

// routes/web.php — passkey routes (provided by Fortify, shown for awareness)
// POST /user/passkeys                → register a new passkey
// DELETE /user/passkeys/{passkey}    → remove a passkey
// POST /passkeys/authenticate        → authenticate with a passkey

// Blade — passkey registration UI (JavaScript handles WebAuthn API calls)
@if(config('fortify.features') && in_array(\Laravel\Fortify\Features::passkeys(), config('fortify.features')))
<div x-data="passkeyManager">
    <button @click="registerPasskey">
        Add a Passkey
    </button>
    <ul>
        @foreach(auth()->user()->passkeys as $passkey)
            <li>
                {{ $passkey->name }} — {{ $passkey->created_at->diffForHumans() }}
                <form method="POST" action="/user/passkeys/{{ $passkey->id }}">
                    @csrf @method('DELETE')
                    <button type="submit">Remove</button>
                </form>
            </li>
        @endforeach
    </ul>
</div>
@endif

// Testing passkeys — use the fake WebAuthn authenticator
class PasskeyTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_a_passkey(): void
    {
        $user = User::factory()->create();

        // Laravel's fake WebAuthn authenticator — no real hardware needed
        WebAuthn::fake();

        $response = $this->actingAs($user)
            ->postJson('/user/passkeys', [
                'name' => 'My MacBook',
            ]);

        $response->assertCreated();
        $this->assertCount(1, $user->fresh()->passkeys);
    }

    public function test_user_can_authenticate_with_passkey(): void
    {
        WebAuthn::fake();

        $user    = User::factory()->withPasskey()->create();
        $passkey = $user->passkeys->first();

        $this->postJson('/passkeys/authenticate', WebAuthn::generateAssertion($passkey))
             ->assertOk();

        $this->assertAuthenticatedAs($user);
    }
}
```

---

## 23. CQRS PATTERN

### Rules

```
RULE CQRS-01: Commands modify state. Queries read state. Never mix them.
RULE CQRS-02: Commands return the created/updated Model or void. Never return query data.
RULE CQRS-03: Query Handlers return read-optimized data — DB views, read replicas, or cache.
RULE CQRS-04: Command Handlers = Actions in most Laravel apps. No need for a separate abstraction.
RULE CQRS-05: Use CQRS when read and write requirements diverge significantly in shape or performance.
```

### Implementation

```php
// COMMAND SIDE — write model
readonly class PlaceOrderCommand
{
    public function __construct(
        public int           $userId,
        public array         $items,
        public string        $shippingAddress,
        public PaymentMethod $paymentMethod,
    ) {}
}

class PlaceOrderHandler  // This IS an Action
{
    public function __construct(
        private OrderRepositoryInterface $orders,
        private InventoryService $inventory,
        private PaymentService $payment,
    ) {}

    public function handle(PlaceOrderCommand $command): Order
    {
        $order = DB::transaction(function () use ($command) {
            $order = $this->orders->create($command);
            $this->inventory->reserve($order);
            $this->payment->charge($order);
            return $order;
        });

        OrderPlaced::dispatch($order);
        return $order;
    }
}

// QUERY SIDE — read-optimized, completely different shape
readonly class GetUserOrdersQuery
{
    public function __construct(
        public int     $userId,
        public ?string $status = null,
        public int     $perPage = 15,
    ) {}
}

class GetUserOrdersHandler
{
    public function handle(GetUserOrdersQuery $query): LengthAwarePaginator
    {
        return DB::table('order_summaries')
            ->where('user_id', $query->userId)
            ->when($query->status, fn($q) => $q->where('status', $query->status))
            ->orderByDesc('created_at')
            ->paginate($query->perPage);
    }
}
```

---

## 24. EVENT SOURCING

### Rules

```
RULE ES-01: Store EVENTS as truth — not current state. State = replay of all events.
RULE ES-02: Domain events are immutable. Never modify stored events.
RULE ES-03: Projectors listen to stored events and build read models for querying.
RULE ES-04: Use spatie/laravel-event-sourcing for production implementations.
RULE ES-05: Use Event Sourcing ONLY for: financial, audit-heavy, or history-critical domains.
RULE ES-06: Do NOT use Event Sourcing for simple CRUD — high complexity cost.
```

### Implementation

```php
// Domain Events (stored in event_store table)
class MoneyAdded extends ShouldBeStored
{
    public function __construct(
        public readonly string $accountUuid,
        public readonly int    $amount,
        public readonly string $reference,
    ) {}
}

// Aggregate — rebuilds state from events
class AccountAggregate extends AggregateRoot
{
    private int $balance = 0;

    public function addMoney(int $amount, string $reference): self
    {
        if ($amount <= 0) throw new InvalidAmountException('Amount must be positive.');
        $this->recordThat(new MoneyAdded($this->uuid(), $amount, $reference));
        return $this;
    }

    public function subtractMoney(int $amount, string $reference): self
    {
        if ($this->balance < $amount) throw new InsufficientFundsException();
        $this->recordThat(new MoneySubtracted($this->uuid(), $amount, $reference));
        return $this;
    }

    protected function applyMoneyAdded(MoneyAdded $event): void
    {
        $this->balance += $event->amount;
    }
}

// Projector — builds read model
class AccountBalanceProjector extends Projector
{
    public function onMoneyAdded(MoneyAdded $event): void
    {
        AccountBalance::where('uuid', $event->accountUuid)->increment('balance', $event->amount);
    }
}

// Usage
AccountAggregate::retrieve($accountUuid)->addMoney(5000, 'DEP-001')->persist();
```

---

## 25. MULTI-TENANCY

### Rules

```
RULE MT-01: Identify tenant via subdomain, header, or JWT claim in Middleware — runs first.
RULE MT-02: Bind tenant as scoped singleton: app()->instance(Tenant::class, $tenant).
RULE MT-03: Apply TenantScope as a Global Scope on all tenant-aware Models.
RULE MT-04: Auto-assign tenant_id on creating() via a BelongsToTenant trait.
RULE MT-05: Never trust tenant_id from client request — always derive from authenticated context.
RULE MT-06: For DB-per-tenant, switch connection in Middleware. Don't cache cross-tenant.
```

### Implementation

```php
// Middleware (registered in bootstrap/app.php — NOT Kernel.php)
class IdentifyTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $subdomain = explode('.', $request->getHost())[0];

        $tenant = Tenant::where('subdomain', $subdomain)
            ->where('is_active', true)
            ->firstOr(fn() => abort(404));

        app()->instance(Tenant::class, $tenant);
        return $next($request);
    }
}

// bootstrap/app.php — registering tenant middleware (L13, no Kernel.php)
return Application::configure(basePath: dirname(__DIR__))
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->prepend(IdentifyTenant::class);
    })
    ->create();

// Global Scope
class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (app()->has(Tenant::class)) {
            $builder->where('tenant_id', app(Tenant::class)->id);
        }
    }
}

// Trait — add to every tenant-aware model
trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function (Model $model) {
            if (app()->has(Tenant::class)) {
                $model->tenant_id ??= app(Tenant::class)->id;
            }
        });
    }
}

#[ObservedBy([OrderObserver::class])]
class Order extends Model
{
    use BelongsToTenant;  // tenant_id auto-set, auto-scoped on ALL queries
}
```

---

## 26. ADVANCED TESTING

### Rules

```
RULE TEST-01: Unit test Actions and Services in isolation — mock all dependencies.
RULE TEST-02: Feature test full HTTP flows — use actingAs(), assertStatus(), assertJson().
RULE TEST-03: Always use Event::fake() when testing code that dispatches events.
RULE TEST-04: Always use Mail::fake(), Notification::fake(), Http::fake() for external calls.
RULE TEST-05: Use RefreshDatabase trait — never leave DB state between tests.
RULE TEST-06: Test BOTH allowed and denied authorization scenarios.
RULE TEST-07: Use Pest arch() tests to enforce architectural rules across the codebase.
RULE TEST-08: Name tests descriptively: test_admin_can_delete_any_post.
RULE TEST-09: Use Factory states for realistic data: PostFactory::new()->published()->create().
RULE TEST-10: For AI SDK tests, use fake providers — never call real AI APIs in tests.
RULE TEST-11: For Passkey tests, use WebAuthn::fake() — never require real hardware in tests.
```

### Implementation

```php
// Feature Test — full HTTP flow
class OrderCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_place_order(): void
    {
        Event::fake([OrderPlaced::class]);
        Mail::fake();

        $user    = User::factory()->create();
        $product = Product::factory()->inStock()->create(['price' => 2999]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'items'            => [['product_id' => $product->id, 'quantity' => 2]],
            'shipping_address' => '123 Main St, Casablanca',
            'payment_method'   => 'card',
        ]);

        $response->assertCreated()
                 ->assertJsonStructure(['id', 'status', 'total', 'items']);

        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'status' => 'pending']);

        Event::assertDispatched(OrderPlaced::class,
            fn($e) => $e->order->user_id === $user->id
        );
    }

    public function test_guest_cannot_place_order(): void
    {
        $this->postJson('/api/orders', [])->assertUnauthorized();
    }

    public function test_out_of_stock_product_returns_unprocessable(): void
    {
        $user    = User::factory()->create();
        $product = Product::factory()->outOfStock()->create();

        $this->actingAs($user)->postJson('/api/orders', [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertUnprocessable();
    }
}

// Policy Test
class PostPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_update_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->for($user)->create();
        $this->assertTrue($user->can('update', $post));
    }

    public function test_non_owner_cannot_update_post(): void
    {
        $other = User::factory()->create();
        $post  = Post::factory()->create();
        $this->assertFalse($other->can('update', $post));
    }
}

// Architecture Tests (Pest)
arch('controllers must not use models directly')
    ->expect('App\Http\Controllers')
    ->not->toUse('App\Models');

arch('actions must be readonly')
    ->expect('App\Actions')
    ->toBeReadonly();

arch('repositories must implement an interface')
    ->expect('App\Repositories\Eloquent')
    ->toImplement('App\Contracts\Repositories');

arch('DTOs must be readonly')
    ->expect('App\DTO')
    ->toBeReadonly();

arch('no debug functions in production code')
    ->expect('App')
    ->not->toUse(['dd', 'dump', 'ray', 'var_dump']);

arch('no Kernel.php references — use bootstrap/app.php')
    ->expect('App')
    ->not->toUse('App\Http\Kernel');
```

---

## 27. DECISION TREES

### Which layer handles this?

```
Business operation requested?
├── Single atomic operation with one clear responsibility  → Action
├── Orchestrates multiple Actions + external APIs         → Service
└── Simple read with no logic                             → Repository method directly

Data access needed?
├── Single Model CRUD                                     → Repository method
├── Complex filtered/paginated query                      → Repository with when() chains
├── Analytics / reporting (different shape than write)   → CQRS Query Handler
└── Millions of rows                                      → Repository + lazyById()

Something happened?
├── Multiple independent reactions needed                 → Event + multiple Listeners
├── One specific async task                               → Job directly
├── Runs on EVERY model save regardless of origin         → Observer
└── Complex sequential workflow                           → Pipeline

Async task?
├── Single job                                            → ShouldQueue on Listener or Job
├── Many parallel jobs + collective callback              → Bus::batch()
├── Sequential steps with shared state                   → Pipeline
└── Must not run twice simultaneously                    → ShouldBeUnique + WithoutOverlapping

Authorization?
├── Model-based (can user edit THIS post?)                → Policy
├── Non-model (can user view dashboard?)                  → Gate
├── Role-based                                            → hasRole() inside Policy
├── Attribute-based (clearance, time, IP, network)        → ABAC inside Policy
├── Relationship-based (team member, project access)      → ReBAC inside Policy
└── Multiple combined rules                               → PolicyEngine (PBAC)

Caching?
├── Simple query result                                   → Cache::remember()
├── Grouped invalidation by model type                   → Cache::tags()
├── Thundering herd risk (cold cache + many requests)    → Cache::lock()
├── Extend TTL of active item without re-fetching        → Cache::touch()  [L13 NEW]
└── User/tenant-specific with bulk invalidation          → Versioned key namespace

Config value needed?
├── Type is known (bool, int, float, string, array)      → config('key', as: 'type')  [L13 NEW]
└── Nullable or mixed-type                               → config('key') ?? $default

Auth / identity?
├── Traditional password login                            → Laravel Fortify (unchanged)
├── Passwordless, phishing-resistant, device-bound       → Passkeys via Fortify  [L13 NEW]
└── Two-factor authentication                             → Fortify TwoFactorAuthentication

AI feature needed?
├── Multi-turn conversation with tools                    → AI Agent (app/Ai/Agents/)
├── One-off text generation                               → Ai::text() inline
├── Image / audio generation                              → Dispatch a Job (slow)
├── Semantic search                                       → whereVectorSimilarTo() + embeddings
└── Simple classification / extraction                   → Ai::text() with structured prompt

Middleware configuration needed?
├── Global middleware                                     → bootstrap/app.php withMiddleware()
├── Route group middleware                                → Route::middleware() or #[Middleware]
├── Controller-level middleware                           → #[Middleware] attribute on class
└── Method-level middleware                               → #[Middleware] attribute on method
    ⚠️  NEVER: app/Http/Kernel.php — it is REMOVED in L13
```

### Event vs Observer vs Job

```
USE EVENTS + LISTENERS when:
  ✓ Multiple independent reactions (email + analytics + webhook at once)
  ✓ Reactions change over time without touching the original code
  ✓ Reactions need retry/backoff on failure

USE OBSERVERS when:
  ✓ Logic runs on EVERY save of that model, regardless of origin
  ✓ Normalizing data BEFORE insert (creating hook)
  ✓ Cascading deletes or related model creation
  ✓ Audit logging on every change

USE JOBS when:
  ✓ One specific async task dispatched from one specific place
  ✓ You need queue, delay, priority control
  ✓ The task is complex enough for its own class

NEVER:
  ✗ Dispatch domain Events from inside Observers
  ✗ Put business logic inside Event classes
  ✗ Load relationships inside Listeners (they are already serialized)
  ✗ Call AI SDK directly in Controllers for slow operations — use Jobs
  ✗ Reference app/Http/Kernel.php — use bootstrap/app.php
```

---

## 28. QUICK REFERENCE — ARTISAN COMMANDS

```bash
# Standard generators
php artisan make:policy   PostPolicy --model=Post
php artisan make:event    OrderPlaced
php artisan make:listener SendOrderConfirmation --event=OrderPlaced
php artisan make:observer UserObserver --model=User
php artisan make:job      ProcessPayment
php artisan make:request  CreateOrderRequest
php artisan make:resource OrderResource
php artisan make:cast     MoneyCast
php artisan make:command  GenerateMonthlyReports

# L13 AI SDK
php artisan make:agent    SupportAgent

# L13 Route debugging — NEW
php artisan route:conflicts   # Detects overlapping route definitions that could cause
                              # unexpected behavior in large route files

# No artisan command — create manually:
# app/Actions/Orders/CreateOrder.php
# app/DTO/CreateOrderDTO.php
# app/Repositories/EloquentOrderRepository.php
# app/Contracts/Repositories/OrderRepositoryInterface.php
# app/Pipelines/Checkout/ApplyCoupon.php
# app/ValueObjects/Money.php
# app/Providers/QueueServiceProvider.php   ← L13: Queue::route() goes here
# app/Ai/Agents/SupportAgent.php           ← L13: AI Agent

# Clear caches after upgrade or config changes
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Upgrade path from L12 → L13 (estimated ~10 minutes for typical apps)
# 1. Upgrade PHP to 8.3+ on your server/CI first
# 2. composer require laravel/framework:^13.0
# 3. Remove app/Http/Kernel.php references — move config to bootstrap/app.php
# 4. Update CSRF references from VerifyCsrfToken to PreventRequestForgery
# 5. Review cache/session naming defaults if you have custom cache store implementations
# 6. Run php artisan route:conflicts to check for newly exposed route overlaps
# 7. Run full test suite — php artisan test
```

---

## CHANGELOG vs PREVIOUS VERSION

| What changed | Detail |
|---|---|
| PHP minimum | 8.2 → **8.3** (8.4 and 8.5 also supported — noted in hard requirements) |
| PHP Attributes | Renamed section from "PHP 13 Attributes" → **"PHP Attribute-Based Configuration"** to avoid PHP/Laravel version confusion. PHP Attributes are a PHP 8.0 language feature; L13 expanded first-party framework use of them. |
| `#[Tries]` / `#[Backoff]` / `#[Timeout]` | Clarified these **predate L13** — they existed in L10/11/12. In L13 they are the **preferred style** over class properties. |
| `once()` helper | Added attribution: introduced in **Laravel 10**, available in L11/12/13. |
| `Bus::batch()` | Added note: available since **Laravel 8**, not new to L13. |
| RULE ACT-08 | Corrected: readonly Actions is a **design recommendation**, not an L13 framework constraint. |
| Queue Routing | New section — `Queue::route()` centralized in ServiceProvider |
| Cache::touch() | New rule CACHE-04 added |
| JSON:API Resources | New section 18 — first-party JSON:API spec support |
| Semantic/Vector Search | New section 19 — `whereVectorSimilarTo()` + pgvector |
| Laravel AI SDK | New section 20 — Agents, text, images, audio, embeddings |
| **Typed Configuration** | **NEW** — Section 21: `config('key', as: 'type')`, `ConfigTypeMismatchException` |
| **Passkeys Authentication** | **NEW** — Section 22: first-party WebAuthn via Fortify, `WebAuthn::fake()` for tests |
| **Prepared statement caching** | **NEW** — RULE ELQ-11: ON by default in L13, noted in Advanced Eloquent |
| **`route:conflicts` command** | **NEW** — added to Quick Reference (Section 28) |
| **Kernel.php removal** | **NEW** — RULE G-16, bootstrap/app.php used throughout, multi-tenancy example updated, arch() test added |
| **PHP 8.4/8.5 support** | **NEW** — noted in hard requirements header |
| CSRF middleware | Updated reference: `PreventRequestForgery` (not `VerifyCsrfToken`) |
| Decision Trees | Added branches for: typed config, passkeys, middleware config (with Kernel.php warning) |
| Symfony | Updated to 7.4 / 8.0 components |

---

*Laravel 13 · Released March 17, 2026 · PHP 8.3+ (8.4, 8.5 supported) · Symfony 7.4/8.0*
*All patterns verified against Laravel 13.x official documentation and release notes.*
