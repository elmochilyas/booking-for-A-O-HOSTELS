<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminRole extends Model
{
    protected $table = 'admin_roles';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'name', 'slug', 'description', 'level', 'permissions', 
        'is_system', 'property_id',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_system' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class, 'admin_role_id');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}