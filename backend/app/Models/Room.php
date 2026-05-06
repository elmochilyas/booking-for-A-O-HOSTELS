<?php

namespace App\Models;

use App\Enums\RoomStatus;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('rooms', key: 'room_id')]
#[Hidden(['created_at', 'updated_at'])]
class Room extends Model
{
    use HasFactory, HasUuids;
    
    protected $fillable = [
        'property_id', 'room_type_id', 'room_number', 'floor',
        'status', 'features', 'view', 'window_type',
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
    
    public function __set($name, $value)
    {
        if ($name === 'id') {
            $this->setAttribute($this->getKeyName(), $value);
            return;
        }
        
        parent::__set($name, $value);
    }
    
    protected $casts = [
        'floor' => 'integer',
        'status' => RoomStatus::class,
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
