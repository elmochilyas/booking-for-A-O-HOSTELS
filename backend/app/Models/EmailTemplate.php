<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['id', 'name', 'slug', 'subject', 'body', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
