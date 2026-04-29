<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['check_in_date', 'check_out_date']);
            $table->index(['status', 'property_id']);
            $table->index(['guest_id', 'created_at']);
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->index(['room_type_id', 'status']);
            $table->index(['property_id', 'status']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['booking_id', 'status']);
        });

        Schema::table('guests', function (Blueprint $table) {
            $table->index('email');
            $table->index(['is_loyalty_member', 'loyalty_points']);
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->index('email');
            $table->index(['property_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['check_in_date', 'check_out_date']);
            $table->dropIndex(['status', 'property_id']);
            $table->dropIndex(['guest_id', 'created_at']);
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropIndex(['room_type_id', 'status']);
            $table->dropIndex(['property_id', 'status']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['booking_id', 'status']);
        });
    }
};