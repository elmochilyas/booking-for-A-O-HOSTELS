<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Amenity extends Model
{
    protected $table = 'amenities';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'property_id', 'name', 'category',
        'description', 'icon', 'is_free',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    protected $casts = [
        'is_free' => 'boolean',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}
