<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Payment extends Model
{
    use HasUuids;

    protected $table = 'payments';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'booking_id',
        'amount',
        'payment_method',
        'status',
        'payment_type',
        'stripe_payment_id',
        'stripe_charge_id',
        'transaction_id',
        'failure_reason',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isRefunded(): bool
    {
        return $this->status === 'refunded';
    }

    public function markAsSuccess(string $stripePaymentId = null): void
    {
        $this->update([
            'status' => 'success',
            'stripe_payment_id' => $stripePaymentId ?? $this->stripe_payment_id,
            'processed_at' => now(),
        ]);
    }

    public function markAsFailed(string $reason): void
    {
        $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);
    }

    public function markAsRefunded(): void
    {
        $this->update(['status' => 'refunded']);
    }
}