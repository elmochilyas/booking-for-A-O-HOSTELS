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
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('phone', 20)->nullable();
            $table->string('country', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable();
            $table->text('address')->nullable();
            $table->string('id_type', 50)->nullable();
            $table->string('id_number')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('is_loyalty_member')->default(false);
            $table->integer('loyalty_points')->default(0);
            $table->boolean('notification_email')->default(true);
            $table->boolean('notification_sms')->default(false);
            $table->timestamps();

            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
