<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('extras', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->enum('price_type', ['per_booking', 'per_night', 'per_person'])->default('per_booking');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_available_online')->default(true);
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->index('property_id');
            $table->index('is_active');
        });

        Schema::create('booking_extra', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('booking_id');
            $table->uuid('extra_id');
            $table->integer('quantity')->default(1);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();

            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('extra_id')->references('id')->on('extras')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_extra');
        Schema::dropIfExists('extras');
    }
};