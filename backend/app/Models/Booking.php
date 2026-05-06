<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Observers\BookingObserver;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('bookings', key: 'booking_id')]
#[Hidden(['created_at', 'updated_at'])]
#[ObservedBy([BookingObserver::class])]
class Booking extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'guest_id', 'property_id', 'room_type_id', 'room_id',
        'check_in_date', 'check_out_date', 'guest_count',
        'total_price', 'status', 'payment_status',
        'special_requests', 'cancellation_reason', 'refund_amount',
        'actual_check_in', 'actual_check_out',
    ];

    protected $table = 'bookings';

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
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'guest_count' => 'integer',
        'total_price' => 'decimal:2',
        'status' => BookingStatus::class,
        'payment_status' => PaymentStatus::class,
        'refund_amount' => 'decimal:2',
        'actual_check_in' => 'datetime',
        'actual_check_out' => 'datetime',
    ];

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class, 'guest_id');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCheckedIn($query)
    {
        return $query->where('status', 'checked_in');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function canTransitionTo(BookingStatus $newStatus): bool
    {
        $currentStatus = $this->status instanceof BookingStatus ? $this->status : BookingStatus::from($this->status);

        // Define valid transitions
        $validTransitions = [
            BookingStatus::PENDING->value => [BookingStatus::CONFIRMED, BookingStatus::CANCELLED],
            BookingStatus::CONFIRMED->value => [BookingStatus::CHECKED_IN, BookingStatus::CANCELLED],
            BookingStatus::CHECKED_IN->value => [BookingStatus::COMPLETED, BookingStatus::CANCELLED],
            BookingStatus::COMPLETED->value => [], // No transitions from completed
            BookingStatus::CANCELLED->value => [], // No transitions from cancelled
        ];

        $allowed = $validTransitions[$currentStatus->value] ?? [];

        return in_array($newStatus, $allowed);
    }
}
