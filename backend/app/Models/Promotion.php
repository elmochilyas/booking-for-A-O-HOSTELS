<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Promotion extends Model
{
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
        'id', 'property_id', 'name', 'description', 'discount_type', 'discount_value',
        'promo_code', 'start_date', 'end_date', 'min_nights', 'room_type_ids',
        'is_active', 'usage_limit', 'usage_count',
    ];

    protected $casts = [
        'room_type_ids' => 'array',
        'is_active' => 'boolean',
        'discount_value' => 'decimal:2',
    ];
}
