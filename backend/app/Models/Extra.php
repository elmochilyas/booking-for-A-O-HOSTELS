<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Extra extends Model
{
    protected $table = 'extras';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'property_id', 'name', 'description',
        'price', 'price_type', 'is_active',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}
