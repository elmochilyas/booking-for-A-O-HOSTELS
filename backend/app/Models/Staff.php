<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Staff extends Authenticatable
{
    use Notifiable, HasUuids;

    protected $table = 'staff';
    protected $primaryKey = 'id';

    protected $fillable = [
        'email',
        'password_hash',
        'first_name',
        'last_name',
        'role',
        'property_id',
        'is_active',
        'phone',
        'last_login',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_login' => 'datetime',
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

    public function property()
    {
        return $this->belongsTo(\App\Models\Property::class, 'property_id');
    }

    public function bookings()
    {
        return $this->hasMany(\App\Models\Booking::class, 'created_by');
    }

    public function isReception(): bool
    {
        return $this->role === 'reception';
    }

    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function canManageProperty(string $propertyId): bool
    {
        return $this->isSuperAdmin() || $this->isAdmin() || ($this->isManager() && $this->property_id === $propertyId);
    }
}