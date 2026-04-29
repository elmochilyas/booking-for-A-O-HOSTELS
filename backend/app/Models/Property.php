<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    protected $table = 'properties';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'name', 'location', 'address', 'latitude', 'longitude',
        'check_in_time', 'check_out_time', 'total_rooms', 'description',
        'phone', 'email', 'images', 'amenities', 'rating', 'review_count',
    ];

    protected $casts = [
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
        'total_rooms' => 'integer',
        'rating' => 'decimal:1',
        'review_count' => 'integer',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class, 'property_id');
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'property_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'property_id');
    }

    public function amenities(): HasMany
    {
        return $this->hasMany(Amenity::class, 'property_id');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class, 'property_id');
    }
}