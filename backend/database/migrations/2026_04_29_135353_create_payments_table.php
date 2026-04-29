<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('booking_id');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 50);
            $table->enum('status', ['pending', 'success', 'failed', 'refunded', 'cancelled'])->default('pending');
            $table->enum('payment_type', ['deposit', 'balance', 'full', 'refund'])->default('full');
            $table->string('stripe_payment_id', 100)->nullable();
            $table->string('stripe_charge_id', 100)->nullable();
            $table->string('transaction_id', 100)->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->index('booking_id');
            $table->index('stripe_payment_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};