<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

#[Table('properties', key: 'property_id')]
#[Hidden(['created_at', 'updated_at'])]
class Property extends Model
{
    use HasFactory, HasUuids;
    
    protected $fillable = [
        'name', 'location', 'address', 'latitude', 'longitude',
        'check_in_time', 'check_out_time', 'total_rooms',
        'description', 'phone', 'email', 'images', 'rating', 'review_count',
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
    
    protected $casts = [
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
        'check_in_time' => 'datetime:H:i',
        'check_out_time' => 'datetime:H:i',
        'total_rooms' => 'integer',
        'rating' => 'decimal:1',
        'review_count' => 'integer',
        'images' => 'array',
    ];

    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class, 'property_id');
    }

    public function rooms(): HasManyThrough
    {
        return $this->hasManyThrough(Room::class, RoomType::class, 'property_id', 'room_type_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'property_id');
    }
}
