<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('booking_id')->primary();
            $table->uuid('guest_id');
            $table->uuid('property_id');
            $table->uuid('room_type_id');
            $table->uuid('room_id')->nullable();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->integer('guest_count');
            $table->decimal('total_price', 10, 2);
            
            // Use string for SQLite compatibility, enum for MySQL
            if (DB::getDriverName() !== 'sqlite') {
                $table->enum('status', ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'])->default('pending');
                $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded'])->default('pending');
            } else {
                $table->string('status', 20)->default('pending');
                $table->string('payment_status', 20)->default('pending');
            }
            
            $table->text('special_requests')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->timestamp('actual_check_in')->nullable();
            $table->timestamp('actual_check_out')->nullable();
            $table->timestamps();
            
            $table->foreign('guest_id')->references('guest_id')->on('guests')->onDelete('cascade');
            $table->foreign('property_id')->references('property_id')->on('properties')->onDelete('cascade');
            $table->foreign('room_type_id')->references('room_type_id')->on('room_types')->onDelete('cascade');
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('set null');
            $table->index('guest_id');
            $table->index('property_id');
            $table->index('check_in_date');
            $table->index('check_out_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
