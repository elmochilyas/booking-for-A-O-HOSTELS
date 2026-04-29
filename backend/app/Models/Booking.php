<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Booking extends Model
{
    use HasUuids;

    protected $table = 'bookings';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'guest_id',
        'property_id',
        'room_type_id',
        'room_id',
        'check_in_date',
        'check_out_date',
        'guest_count',
        'total_price',
        'deposit_amount',
        'balance_amount',
        'status',
        'payment_status',
        'booking_reference',
        'special_requests',
        'cancellation_reason',
        'cancelled_at',
        'checked_in_at',
        'checked_out_at',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'total_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'guest_count' => 'integer',
        'cancelled_at' => 'datetime',
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->booking_reference)) {
                $booking->booking_reference = self::generateBookingReference();
            }
        });
    }

    public static function generateBookingReference(): string
    {
        $prefix = 'AO';
        $random = strtoupper(substr(uniqid(), -6));
        $year = date('Y');
        return "{$prefix}{$year}{$random}";
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class, 'guest_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'booking_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'booking_id');
    }

    public function extras()
    {
        return $this->belongsToMany(Extra::class, 'booking_extra', 'booking_id', 'extra_id')
            ->withPivot('quantity', 'total_price');
    }

    public function promotions()
    {
        return $this->belongsToMany(Promotion::class, 'booking_promotion', 'booking_id', 'promotion_id')
            ->withPivot('discount_amount');
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function canCheckIn(): bool
    {
        return $this->status === 'confirmed' && now()->gte($this->check_in_date);
    }

    public function canCheckOut(): bool
    {
        return $this->checked_in_at && !$this->checked_out_at;
    }

    public function cancel(string $reason = null): bool
    {
        if ($this->isCancelled()) {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);

        if ($this->room_id) {
            $this->room()->update(['status' => 'available']);
        }

        return true;
    }

    public function checkIn(): bool
    {
        if (!$this->canCheckIn()) {
            return false;
        }

        $this->update([
            'checked_in_at' => now(),
            'status' => 'completed',
        ]);

        if ($this->room_id) {
            $this->room()->update(['status' => 'occupied']);
        }

        return true;
    }

    public function checkOut(): bool
    {
        if (!$this->canCheckOut()) {
            return false;
        }

        $this->update([
            'checked_out_at' => now(),
            'status' => 'completed',
        ]);

        if ($this->room_id) {
            $this->room()->update(['status' => 'cleaning']);
        }

        return true;
    }

    public function getNightsCount(): int
    {
        return $this->check_in_date->diffInDays($this->check_out_date);
    }
}