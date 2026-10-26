<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            // Trip planner: recommended safari days in this park (empty = not offered as a safari park).
            $table->unsignedTinyInteger('planner_days')->nullable()->after('best_time');
            // Trip planner: position on the driving route from Arusha (lower = visited first).
            $table->unsignedSmallInteger('planner_order')->default(0)->after('planner_days');
        });
    }

    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn(['planner_days', 'planner_order']);
        });
    }
};
