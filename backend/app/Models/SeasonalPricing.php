<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SeasonalPricing extends Model
{
    protected $table = 'seasonal_pricing';

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
        'id', 'property_id', 'room_type_id', 'start_date', 'end_date',
        'multiplier', 'fixed_price', 'min_nights',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'multiplier' => 'decimal:2',
        'fixed_price' => 'decimal:2',
        'min_nights' => 'integer',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }
}
