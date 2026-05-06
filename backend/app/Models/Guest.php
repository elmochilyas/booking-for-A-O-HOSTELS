<?php

namespace App\Models;

use App\Enums\GuestStatus;
use App\Observers\GuestObserver;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('guests', key: 'guest_id')]
#[Hidden([
    'password_hash', 'id_type', 'id_number',
    'email_verified_at', 'created_at', 'updated_at',
])]
#[ObservedBy([GuestObserver::class])]
class Guest extends Model
{
    use HasFactory, HasUuids;
    
    protected $fillable = [
        'email', 'password_hash', 'first_name', 'last_name',
        'phone', 'country', 'date_of_birth', 'gender',
        'address', 'id_type', 'id_number',
        'email_verified_at', 'verification_token',
        'is_loyalty_member', 'loyalty_points',
        'notification_email', 'notification_sms',
        'is_banned', 'ban_reason', 'banned_at',
    ];

    protected $table = 'guests';
    
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
        'date_of_birth' => 'date',
        'email_verified_at' => 'datetime',
        'is_loyalty_member' => 'boolean',
        'loyalty_points' => 'integer',
        'notification_email' => 'boolean',
        'notification_sms' => 'boolean',
        'is_banned' => 'boolean',
        'banned_at' => 'datetime',
        'status' => GuestStatus::class,
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'guest_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
