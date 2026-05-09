<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\RoomStatus;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('rooms')]
#[Hidden(['created_at', 'updated_at'])]
class Room extends Model
{
    use HasUuids;

    protected $fillable = [
        'property_id', 'room_type_id', 'room_number', 'floor',
        'status', 'features', 'view', 'window_type',
    ];

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
