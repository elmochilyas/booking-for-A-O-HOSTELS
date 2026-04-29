<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $table = 'payments';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'booking_id', 'amount', 'payment_method',
        'status', 'stripe_payment_id', 'stripe_client_secret',
        'failure_message', 'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}