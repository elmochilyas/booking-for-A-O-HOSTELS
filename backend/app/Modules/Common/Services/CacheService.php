<?php

namespace App\Modules\Common\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    private const DEFAULT_TTL = 3600;

    public function remember(string $key, callable $callback, int $ttl = self::DEFAULT_TTL): mixed
    {
        return Cache::remember($key, $ttl, $callback);
    }

    public function rememberForever(string $key, callable $callback): mixed
    {
        return Cache::rememberForever($key, $callback);
    }

    public function forget(string $key): void
    {
        Cache::forget($key);
    }

    public function flush(string $pattern): void
    {
        Cache::flush();
    }

    public function getPropertyCacheKey(string $propertyId, string $type = 'detail'): string
    {
        return "property:{$propertyId}:{$type}";
    }

    public function getAvailabilityCacheKey(string $propertyId, string $checkIn, string $checkOut, int $guests): string
    {
        return "availability:{$propertyId}:{$checkIn}:{$checkOut}:{$guests}";
    }

    public function getRoomTypesCacheKey(string $propertyId): string
    {
        return "property:{$propertyId}:roomtypes";
    }

    public function invalidatePropertyCache(string $propertyId): void
    {
        Cache::forget("property:{$propertyId}:detail");
        Cache::forget("property:{$propertyId}:roomtypes");
    }

    public function invalidateAvailabilityCache(string $propertyId): void
    {
        Cache::forget("availability:{$propertyId}:*");
    }

    public function cacheTags(array $tags, string $key, callable $callback, int $ttl = self::DEFAULT_TTL): mixed
    {
        return Cache::tags($tags)->remember($key, $ttl, $callback);
    }
}