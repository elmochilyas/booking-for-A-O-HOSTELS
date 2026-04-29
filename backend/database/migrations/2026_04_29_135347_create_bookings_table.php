<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('guest_id');
            $table->uuid('property_id');
            $table->uuid('room_type_id');
            $table->uuid('room_id')->nullable();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->integer('guest_count');
            $table->decimal('total_price', 10, 2);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->decimal('balance_amount', 10, 2)->default(0);
            $table->enum('status', ['confirmed', 'pending', 'cancelled', 'completed', 'no_show'])->default('pending');
            $table->enum('payment_status', ['paid', 'partial', 'pending', 'refunded'])->default('pending');
            $table->string('booking_reference', 20)->unique();
            $table->text('special_requests')->nullable();
            $table->string('cancellation_reason', 500)->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('checked_out_at')->nullable();
            $table->timestamps();

            $table->foreign('guest_id')->references('id')->on('guests')->onDelete('cascade');
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->foreign('room_type_id')->references('id')->on('room_types')->onDelete('cascade');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
            $table->index('guest_id');
            $table->index('property_id');
            $table->index('check_in_date');
            $table->index('check_out_date');
            $table->index('status');
            $table->index('booking_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};