<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RoomType extends Model
{
    use HasUuids;

    protected $table = 'room_types';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'property_id',
        'name',
        'capacity',
        'base_price',
        'description',
        'image_url',
        'max_occupancy',
        'bed_count',
        'bed_type',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'capacity' => 'integer',
        'max_occupancy' => 'integer',
        'bed_count' => 'integer',
        'is_active' => 'boolean',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function rooms()
    {
        return $this->hasMany(Room::class, 'room_type_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'room_type_id');
    }

    public function amenities()
    {
        return $this->belongsToMany(Amenity::class, 'room_type_amenity', 'room_type_id', 'amenity_id');
    }

    public function seasonalPricing()
    {
        return $this->hasMany(SeasonalPricing::class, 'room_type_id');
    }

    public function getCurrentPrice(\Carbon\Carbon $date = null): float
    {
        $date = $date ?? now();
        $basePrice = (float) $this->base_price;

        $seasonal = $this->seasonalPricing()
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->where('is_active', true)
            ->first();

        if ($seasonal) {
            if ($seasonal->fixed_price) {
                return (float) $seasonal->fixed_price;
            }
            return $basePrice * (float) $seasonal->price_multiplier;
        }

        return $basePrice;
    }
}