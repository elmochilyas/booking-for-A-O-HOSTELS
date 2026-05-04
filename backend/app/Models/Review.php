<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Review extends Model
{
    protected $table = 'reviews';

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

    protected $fillable = [
        'id', 'booking_id', 'guest_id', 'property_id',
        'overall_rating', 'cleanliness_rating', 'staff_rating',
        'value_rating', 'location_rating', 'comfort_rating',
        'review_text', 'photos', 'status', 'moderation_notes',
    ];

    protected $casts = [
        'overall_rating' => 'integer',
        'cleanliness_rating' => 'integer',
        'staff_rating' => 'integer',
        'value_rating' => 'integer',
        'location_rating' => 'integer',
        'comfort_rating' => 'integer',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class, 'guest_id');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
