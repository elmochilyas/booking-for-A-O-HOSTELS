<?php

namespace App\Providers;

use App\Jobs\GenerateUserReportJob;
use App\Jobs\ProcessMonthlyReports;
use App\Jobs\ProcessPaymentJob;
use App\Jobs\RefundPaymentJob;
use App\Jobs\SyncInventoryJob;
use App\Jobs\SyncUserToWarehouse;
use App\Listeners\SendBookingConfirmation;
use App\Listeners\SendPaymentNotification;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;

class QueueServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Payment jobs
        Queue::route(ProcessPaymentJob::class, connection: 'redis', queue: 'payments');
        Queue::route(RefundPaymentJob::class, connection: 'redis', queue: 'payments');

        // Notification jobs/listeners
        Queue::route(SendBookingConfirmation::class, connection: 'redis', queue: 'notifications');
        Queue::route(SendPaymentNotification::class, connection: 'redis', queue: 'notifications');

        // Warehouse/integration jobs
        Queue::route(SyncUserToWarehouse::class, connection: 'redis', queue: 'warehouse');

        // Report generation jobs
        Queue::route(GenerateUserReportJob::class, connection: 'redis', queue: 'reports');
        Queue::route(ProcessMonthlyReports::class, connection: 'redis', queue: 'reports');

        // Inventory jobs
        Queue::route(SyncInventoryJob::class, connection: 'sqs', queue: 'inventory');
    }
}
