<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthCheckController
{
    public function check(): JsonResponse
    {
        $status = 'healthy';
        $checks = [];

        $checks['database'] = $this->checkDatabase();
        $checks['redis'] = $this->checkRedis();
        $checks['storage'] = $this->checkStorage();

        foreach ($checks as $check) {
            if ($check['status'] !== 'ok') {
                $status = 'unhealthy';
            }
        }

        return response()->json([
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
            'checks' => $checks,
            'version' => '1.0.0',
        ], $status === 'healthy' ? 200 : 503);
    }

    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            return ['status' => 'ok', 'message' => 'Database connected'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkRedis(): array
    {
        try {
            Cache::put('health_check', true, 10);
            $value = Cache::get('health_check');
            return ['status' => 'ok', 'message' => 'Redis connected'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkStorage(): array
    {
        try {
            $testFile = storage_path('framework/testing/test.txt');
            file_put_contents($testFile, 'test');
            unlink($testFile);
            return ['status' => 'ok', 'message' => 'Storage writable'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}