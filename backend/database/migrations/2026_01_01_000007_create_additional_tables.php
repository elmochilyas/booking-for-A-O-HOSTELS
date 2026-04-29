<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->enum('role', ['reception', 'manager', 'admin', 'superadmin']);
            $table->uuid('property_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login')->nullable();
            $table->timestamps();
            
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('set null');
            $table->index('property_id');
        });

        Schema::create('amenities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id');
            $table->string('name');
            $table->string('category', 50);
            $table->text('description')->nullable();
            $table->string('icon', 50)->nullable();
            $table->boolean('is_free')->default(true);
            $table->timestamps();
            
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });

        Schema::create('extras', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->enum('price_type', ['per_stay', 'per_night', 'per_person'])->default('per_stay');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });

        Schema::create('booking_extras', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('booking_id');
            $table->uuid('extra_id');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 10, 2);
            $table->timestamps();
            
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('extra_id')->references('id')->on('extras')->onDelete('cascade');
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('booking_id');
            $table->uuid('guest_id');
            $table->uuid('property_id');
            $table->integer('overall_rating');
            $table->integer('cleanliness_rating')->nullable();
            $table->integer('staff_rating')->nullable();
            $table->integer('value_rating')->nullable();
            $table->integer('location_rating')->nullable();
            $table->integer('comfort_rating')->nullable();
            $table->text('review_text')->nullable();
            $table->json('photos')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('moderation_notes')->nullable();
            $table->timestamps();
            
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('guest_id')->references('id')->on('guests')->onDelete('cascade');
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });

        Schema::create('seasonal_pricing', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id');
            $table->uuid('room_type_id')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('multiplier', 3, 2)->default(1.00);
            $table->decimal('fixed_price', 10, 2)->nullable();
            $table->integer('min_nights')->nullable();
            $table->timestamps();
            
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->foreign('room_type_id')->references('id')->on('room_types')->onDelete('cascade');
        });

        Schema::create('promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed']);
            $table->decimal('discount_value', 10, 2);
            $table->string('promo_code', 50)->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('min_nights')->nullable();
            $table->json('room_type_ids')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_count')->default(0);
            $table->timestamps();
            
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('seasonal_pricing');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('booking_extras');
        Schema::dropIfExists('extras');
        Schema::dropIfExists('amenities');
        Schema::dropIfExists('staff');
    }
};