<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Guest extends Authenticatable
{
    use Notifiable, HasUuids;

    protected $table = 'guests';
    protected $primaryKey = 'id';

    protected $fillable = [
        'email',
        'password_hash',
        'first_name',
        'last_name',
        'phone',
        'country',
        'date_of_birth',
        'is_loyalty_member',
        'loyalty_points',
        'email_verified_at',
        'verification_token',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
        'verification_token',
    ];

    protected $casts = [
        'is_loyalty_member' => 'boolean',
        'loyalty_points' => 'integer',
        'email_verified_at' => 'datetime',
        'date_of_birth' => 'date',
    ];

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function getAuthIdentifierName(): string
    {
        return 'id';
    }

    public function getAuthIdentifier(): string
    {
        return $this->id;
    }

    public function setPasswordAttribute(string $value): void
    {
        $this->attributes['password_hash'] = bcrypt($value);
    }

    public function bookings()
    {
        return $this->hasMany(\App\Models\Booking::class, 'guest_id');
    }

    public function reviews()
    {
        return $this->hasMany(\App\Models\Review::class, 'guest_id');
    }

    public function isVerified(): bool
    {
        return !is_null($this->email_verified_at);
    }

    public function addLoyaltyPoints(int $points): void
    {
        $this->increment('loyalty_points', $points);
    }

    public function deductLoyaltyPoints(int $points): bool
    {
        if ($this->loyalty_points >= $points) {
            $this->decrement('loyalty_points', $points);
            return true;
        }
        return false;
    }
}