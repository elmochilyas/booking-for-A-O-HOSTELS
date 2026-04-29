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
            $table->string('email', 255)->unique();
            $table->string('password_hash', 255);
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->enum('role', ['reception', 'manager', 'admin', 'superadmin'])->default('reception');
            $table->uuid('property_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('phone', 20)->nullable();
            $table->timestamp('last_login')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('set null');
            $table->index('property_id');
            $table->index('role');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};