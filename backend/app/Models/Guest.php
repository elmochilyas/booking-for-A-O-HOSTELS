<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Guest extends Model
{
    protected $table = 'guests';

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id', 'email', 'password_hash', 'first_name', 'last_name',
        'phone', 'country', 'date_of_birth', 'gender',
        'address', 'id_type', 'id_number',
        'email_verified_at', 'verification_token',
        'is_loyalty_member', 'loyalty_points',
        'notification_email', 'notification_sms',
        'is_banned', 'ban_reason', 'banned_at',
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
        'is_banned' => 'boolean',
        'banned_at' => 'datetime',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'guest_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'guest_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'guest_id');
    }
}
