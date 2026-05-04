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
        'role', 'property_id', 'is_active', 'last_login', 'admin_role_id',
        'two_factor_enabled', 'last_login_at', 'permissions', 'assigned_properties',
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

    public function adminRole(): BelongsTo
    {
        return $this->belongsTo(AdminRole::class, 'admin_role_id');
    }
}
