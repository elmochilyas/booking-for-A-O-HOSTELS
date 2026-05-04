<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $table = 'rooms';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id', 'property_id', 'room_type_id', 'room_number', 'floor',
        'status', 'features', 'view', 'window_type',
    ];

    protected $casts = [
        'floor' => 'integer',
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

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'room_id');
    }
}
