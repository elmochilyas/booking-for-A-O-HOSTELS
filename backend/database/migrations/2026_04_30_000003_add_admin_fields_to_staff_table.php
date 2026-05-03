<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->foreignId('admin_role_id')->nullable()->constrained('admin_roles')->nullOnDelete();
            $table->string('two_factor_secret')->nullable();
            $table->boolean('two_factor_enabled')->default(false);
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->json('permissions')->nullable();
            $table->json('assigned_properties')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropForeign(['admin_role_id']);
            $table->dropColumn([
                'admin_role_id', 'two_factor_secret', 'two_factor_enabled', 
                'last_login_at', 'last_login_ip', 'permissions', 'assigned_properties'
            ]);
        });
    }
};