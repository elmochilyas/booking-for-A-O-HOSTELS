<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemConfig extends Model
{
    protected $table = 'system_config';
    public $timestamps = false;

    protected $fillable = [
        'key', 'value', 'type', 'category', 'description', 'is_encrypted',
    ];

    protected $casts = [
        'is_encrypted' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $config = self::where('key', $key)->first();
        
        if (!$config) {
            return $default;
        }

        $value = $config->value;

        if ($config->is_encrypted && $value) {
            $value = decrypt($value);
        }

        return match ($config->type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    public static function set(string $key, mixed $value, string $type = 'string', string $category = 'general', ?string $description = null, bool $isEncrypted = false): self
    {
        $storeValue = $value;

        if ($isEncrypted) {
            $storeValue = encrypt($value);
        } elseif ($type === 'json') {
            $storeValue = json_encode($value);
        }

        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $storeValue,
                'type' => $type,
                'category' => $category,
                'description' => $description,
                'is_encrypted' => $isEncrypted,
            ]
        );
    }
}