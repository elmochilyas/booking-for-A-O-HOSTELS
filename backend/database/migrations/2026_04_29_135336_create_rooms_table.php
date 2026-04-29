<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id');
            $table->uuid('room_type_id');
            $table->string('room_number', 20);
            $table->integer('floor');
            $table->enum('status', ['available', 'booked', 'maintenance', 'cleaning'])->default('available');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->foreign('room_type_id')->references('id')->on('room_types')->onDelete('cascade');
            $table->unique(['property_id', 'room_number']);
            $table->index('property_id');
            $table->index('room_type_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};