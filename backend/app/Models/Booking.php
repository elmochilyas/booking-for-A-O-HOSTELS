<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    protected $table = 'bookings';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id', 'guest_id', 'property_id', 'room_type_id', 'room_id',
        'check_in_date', 'check_out_date', 'guest_count',
        'total_price', 'status', 'payment_status',
        'special_requests', 'cancellation_reason', 'refund_amount',
        'actual_check_in', 'actual_check_out',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'guest_count' => 'integer',
        'total_price' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'actual_check_in' => 'datetime',
        'actual_check_out' => 'datetime',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class, 'guest_id');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'booking_id');
    }

    public function extras(): HasMany
    {
        return $this->hasMany(BookingExtra::class, 'booking_id');
    }
}
