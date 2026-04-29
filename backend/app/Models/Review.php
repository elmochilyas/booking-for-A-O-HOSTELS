<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Review extends Model
{
    use HasUuids;

    protected $table = 'reviews';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'booking_id',
        'guest_id',
        'property_id',
        'rating',
        'cleanliness_rating',
        'location_rating',
        'staff_rating',
        'value_rating',
        'review_text',
        'response_text',
        'response_date',
        'is_approved',
    ];

    protected $casts = [
        'rating' => 'integer',
        'cleanliness_rating' => 'integer',
        'location_rating' => 'integer',
        'staff_rating' => 'integer',
        'value_rating' => 'integer',
        'response_date' => 'datetime',
        'is_approved' => 'boolean',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class, 'guest_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function getAverageRating(): float
    {
        $ratings = array_filter([
            $this->rating,
            $this->cleanliness_rating,
            $this->location_rating,
            $this->staff_rating,
            $this->value_rating,
        ]);

        return count($ratings) > 0 ? array_sum($ratings) / count($ratings) : 0;
    }
}