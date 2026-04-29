<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seasonal_pricing', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('room_type_id');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('price_multiplier', 5, 2)->default(1.00);
            $table->decimal('fixed_price', 10, 2)->nullable();
            $table->string('season_name', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('room_type_id')->references('id')->on('room_types')->onDelete('cascade');
            $table->index('room_type_id');
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seasonal_pricing');
    }
};