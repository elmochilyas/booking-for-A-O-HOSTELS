<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->unsignedInteger('level')->default(0);
            $table->json('permissions')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->string('property_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_roles');
    }
};