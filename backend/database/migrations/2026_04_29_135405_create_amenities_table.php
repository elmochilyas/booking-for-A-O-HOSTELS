<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('amenities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('icon', 50)->nullable();
            $table->string('category', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('category');
            $table->index('is_active');
        });

        Schema::create('room_type_amenity', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('room_type_id');
            $table->uuid('amenity_id');

            $table->foreign('room_type_id')->references('id')->on('room_types')->onDelete('cascade');
            $table->foreign('amenity_id')->references('id')->on('amenities')->onDelete('cascade');
            $table->unique(['room_type_id', 'amenity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_type_amenity');
        Schema::dropIfExists('amenities');
    }
};