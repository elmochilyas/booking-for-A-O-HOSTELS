<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Property extends Model
{
    use HasUuids;

    protected $table = 'properties';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'location',
        'address',
        'latitude',
        'longitude',
        'check_in_time',
        'check_out_time',
        'total_rooms',
        'description',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'check_in_time' => 'datetime:H:i:s',
        'check_out_time' => 'datetime:H:i:s',
        'total_rooms' => 'integer',
        'is_active' => 'boolean',
    ];

    public function roomTypes()
    {
        return $this->hasMany(RoomType::class, 'property_id');
    }

    public function rooms()
    {
        return $this->hasMany(Room::class, 'property_id');
    }

    public function staff()
    {
        return $this->hasMany(\App\Models\Staff::class, 'property_id');
    }

    public function amenities()
    {
        return $this->belongsToMany(Amenity::class, 'property_amenity', 'property_id', 'amenity_id');
    }
}