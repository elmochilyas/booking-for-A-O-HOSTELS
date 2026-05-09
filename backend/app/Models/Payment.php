<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Observers\PaymentObserver;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('payments')]
#[Hidden(['created_at', 'updated_at'])]
#[ObservedBy([PaymentObserver::class])]
class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'booking_id', 'amount', 'payment_method',
        'status', 'stripe_payment_id', 'stripe_client_secret',
        'failure_message', 'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'status' => PaymentStatus::class,
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
