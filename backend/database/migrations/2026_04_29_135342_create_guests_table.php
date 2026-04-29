<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email', 255)->unique();
            $table->string('password_hash', 255);
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('phone', 20)->nullable();
            $table->string('country', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->boolean('is_loyalty_member')->default(false);
            $table->integer('loyalty_points')->default(0);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('verification_token', 100)->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index('email');
            $table->index('is_loyalty_member');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};