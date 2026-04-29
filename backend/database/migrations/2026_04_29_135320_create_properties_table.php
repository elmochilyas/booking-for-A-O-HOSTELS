<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->string('location', 255);
            $table->text('address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->time('check_in_time')->default('15:00:00');
            $table->time('check_out_time')->default('10:00:00');
            $table->integer('total_rooms')->default(0);
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('location');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};