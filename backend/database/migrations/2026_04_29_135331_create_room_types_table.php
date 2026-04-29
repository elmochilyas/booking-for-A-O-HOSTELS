<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id');
            $table->string('name', 100);
            $table->integer('capacity');
            $table->decimal('base_price', 10, 2);
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->integer('max_occupancy')->default(1);
            $table->integer('bed_count')->default(1);
            $table->string('bed_type', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->index('property_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};