<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->uuid('room_id')->primary();
            $table->uuid('property_id');
            $table->uuid('room_type_id');
            $table->string('room_number', 20);
            $table->integer('floor');
            
            // Use string for SQLite compatibility, enum for MySQL
            if (DB::getDriverName() !== 'sqlite') {
                $table->enum('status', ['available', 'booked', 'maintenance', 'cleaning', 'occupied'])->default('available');
            } else {
                $table->string('status', 20)->default('available');
            }
            
            $table->json('features')->nullable();
            $table->string('view', 50)->nullable();
            $table->string('window_type', 50)->nullable();
            $table->timestamps();
            
            $table->foreign('property_id')->references('property_id')->on('properties')->onDelete('cascade');
            $table->foreign('room_type_id')->references('room_type_id')->on('room_types')->onDelete('cascade');
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
