<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Observers\PaymentObserver;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('payments', key: 'payment_id')]
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

    protected $keyType = 'string';

    public $incrementing = false;

    public function getIdAttribute()
    {
        return $this->getKey();
    }

    public function __get($key)
    {
        if ($key === 'id') {
            return $this->getKey();
        }

        return parent::__get($key);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
