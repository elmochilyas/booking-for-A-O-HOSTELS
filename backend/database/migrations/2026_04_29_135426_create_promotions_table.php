<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('discount_value', 10, 2);
            $table->decimal('min_booking_amount', 10, 2)->nullable();
            $table->decimal('max_discount_amount', 10, 2)->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('max_uses')->nullable();
            $table->integer('current_uses')->default(0);
            $table->uuid('property_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('code');
            $table->index('property_id');
            $table->index(['start_date', 'end_date']);
            $table->index('is_active');
        });

        Schema::create('booking_promotion', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('booking_id');
            $table->uuid('promotion_id');
            $table->decimal('discount_amount', 10, 2);
            $table->timestamps();

            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('promotion_id')->references('id')->on('promotions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_promotion');
        Schema::dropIfExists('promotions');
    }
};