<?php

declare(strict_types=1);

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

#[Table('bookings')]
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
        return $this->belongsTo(Guest::class);
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

    public function canTransitionTo(BookingStatus $newStatus): bool
    {
        $currentStatus = $this->status instanceof BookingStatus ? $this->status : BookingStatus::from($this->status);

        $validTransitions = [
            BookingStatus::PENDING->value => [BookingStatus::CONFIRMED, BookingStatus::CANCELLED],
            BookingStatus::CONFIRMED->value => [BookingStatus::CHECKED_IN, BookingStatus::CANCELLED],
            BookingStatus::CHECKED_IN->value => [BookingStatus::COMPLETED, BookingStatus::CANCELLED],
            BookingStatus::COMPLETED->value => [],
            BookingStatus::CANCELLED->value => [],
        ];

        $allowed = $validTransitions[$currentStatus->value] ?? [];

        return in_array($newStatus, $allowed);
    }
}
