<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Staff extends Model
{
    protected $table = 'staff';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'email', 'password_hash', 'first_name', 'last_name',
        'role', 'property_id', 'is_active', 'last_login',
    ];

    protected $hidden = [
        'password_hash', 'last_login', 'created_at', 'updated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_login' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}