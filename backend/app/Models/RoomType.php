<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('room_types')]
#[Hidden(['created_at', 'updated_at'])]
class RoomType extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'property_id', 'name', 'capacity', 'base_price',
        'description', 'images', 'amenities', 'max_occupancy',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'base_price' => 'decimal:2',
        'max_occupancy' => 'integer',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
