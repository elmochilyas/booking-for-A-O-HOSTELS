<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('payment_id')->primary();
            $table->uuid('booking_id');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 50);

            // Use string for SQLite compatibility, enum for MySQL
            if (DB::getDriverName() !== 'sqlite') {
                $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            } else {
                $table->string('status', 20)->default('pending');
            }

            $table->string('stripe_payment_id', 100)->nullable();
            $table->string('stripe_client_secret')->nullable();
            $table->text('failure_message')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('booking_id')->references('booking_id')->on('bookings')->onDelete('cascade');
            $table->index('booking_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
