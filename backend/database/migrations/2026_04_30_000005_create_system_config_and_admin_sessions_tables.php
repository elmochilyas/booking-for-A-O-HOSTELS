<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_config', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string');
            $table->string('category');
            $table->text('description')->nullable();
            $table->boolean('is_encrypted')->default(false);
            $table->timestamps();
        });

        Schema::create('admin_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('staff_id');
            $table->string('token_hash');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('last_activity')->useCurrent();
            $table->boolean('is_revoked')->default(false);
            $table->timestamp('expires_at');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('staff_id')->references('id')->on('staff')->cascadeOnDelete();
            $table->index('token_hash');
            $table->index(['staff_id', 'is_revoked']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_sessions');
        Schema::dropIfExists('system_config');
    }
};
