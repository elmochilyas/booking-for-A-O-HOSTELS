<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Amenity extends Model
{
    protected $table = 'amenities';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'property_id', 'name', 'category',
        'description', 'icon', 'is_free',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    protected $casts = [
        'is_free' => 'boolean',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}

class Extra extends Model
{
    protected $table = 'extras';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'property_id', 'name', 'description',
        'price', 'price_type', 'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}

class BookingExtra extends Model
{
    protected $table = 'booking_extras';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'booking_id', 'extra_id', 'quantity', 'price',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function extra(): BelongsTo
    {
        return $this->belongsTo(Extra::class, 'extra_id');
    }
}

class SeasonalPricing extends Model
{
    protected $table = 'seasonal_pricing';
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
}

class Promotion extends Model
{
    protected $table = 'promotions';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'property_id', 'name', 'description',
        'discount_type', 'discount_value', 'promo_code',
        'start_date', 'end_date', 'min_nights',
        'room_type_ids', 'is_active', 'usage_limit', 'usage_count',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'min_nights' => 'integer',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $hidden = ['created_at', 'updated_at'];
}