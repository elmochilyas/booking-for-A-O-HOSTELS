<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guest extends Model
{
    protected $table = 'guests';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id', 'email', 'password_hash', 'first_name', 'last_name',
        'phone', 'country', 'date_of_birth', 'gender',
        'address', 'id_type', 'id_number',
        'email_verified_at', 'is_loyalty_member', 'loyalty_points',
        'notification_email', 'notification_sms',
    ];

    protected $hidden = [
        'password_hash', 'id_type', 'id_number',
        'email_verified_at', 'created_at', 'updated_at',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'email_verified_at' => 'datetime',
        'is_loyalty_member' => 'boolean',
        'loyalty_points' => 'integer',
        'notification_email' => 'boolean',
        'notification_sms' => 'boolean',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'guest_id');
    }
}
