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
            $table->string('name');
            $table->integer('capacity');
            $table->decimal('base_price', 10, 2);
            $table->text('description')->nullable();
            $table->json('images')->nullable();
            $table->json('amenities')->nullable();
            $table->integer('max_occupancy')->nullable();
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