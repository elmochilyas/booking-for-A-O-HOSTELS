<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('booking_id');
            $table->uuid('guest_id');
            $table->uuid('property_id');
            $table->integer('rating');
            $table->integer('cleanliness_rating')->nullable();
            $table->integer('location_rating')->nullable();
            $table->integer('staff_rating')->nullable();
            $table->integer('value_rating')->nullable();
            $table->text('review_text')->nullable();
            $table->text('response_text')->nullable();
            $table->timestamp('response_date')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->timestamps();

            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('guest_id')->references('id')->on('guests')->onDelete('cascade');
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->index('property_id');
            $table->index('is_approved');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};