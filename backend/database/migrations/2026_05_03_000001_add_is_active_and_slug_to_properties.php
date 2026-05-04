<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('review_count');
            $table->string('slug')->nullable()->unique()->after('is_active');
        });

        $properties = DB::table('properties')->get();
        foreach ($properties as $property) {
            DB::table('properties')
                ->where('id', $property->id)
                ->update(['slug' => Str::slug($property->name)]);
        }
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'slug']);
        });
    }
};
