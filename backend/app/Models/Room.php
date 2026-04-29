<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Room extends Model
{
    use HasUuids;

    protected $table = 'rooms';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'property_id',
        'room_type_id',
        'room_number',
        'floor',
        'status',
        'notes',
    ];

    protected $casts = [
        'floor' => 'integer',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'room_id');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function isBooked(): bool
    {
        return $this->status === 'booked';
    }

    public function isInMaintenance(): bool
    {
        return $this->status === 'maintenance';
    }
}