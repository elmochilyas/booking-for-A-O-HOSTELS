<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminPermission extends Model
{
    protected $table = 'admin_permissions';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'name', 'slug', 'module', 'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function roles(): HasMany
    {
        return $this->hasMany(AdminRole::class);
    }
}