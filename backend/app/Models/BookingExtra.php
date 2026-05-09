<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BookingExtra extends Model
{
    protected $table = 'booking_extras';

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id', 'booking_id', 'extra_id', 'quantity', 'price',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function bookig(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function extra(): BelongsTo
    {
        return $this->belongsTo(Extra::class, 'extra_id');
    }
}
