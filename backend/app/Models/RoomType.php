<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class RoomType extends Model
{
    protected $table = 'room_types';

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
        'id', 'property_id', 'name', 'capacity', 'base_price',
        'description', 'images', 'amenities', 'max_occupancy',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'base_price' => 'decimal:2',
        'max_occupancy' => 'integer',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'room_type_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'room_type_id');
    }
}
