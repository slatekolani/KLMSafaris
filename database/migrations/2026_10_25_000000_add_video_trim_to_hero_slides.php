<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->decimal('video_start', 6, 2)->nullable()->after('video');
            $table->decimal('video_end', 6, 2)->nullable()->after('video_start');
            $table->decimal('video_speed', 4, 2)->nullable()->after('video_end');
        });
    }

    public function down(): void
    {
        Schema::table('hero_slides', fn (Blueprint $t) => $t->dropColumn(['video_start', 'video_end', 'video_speed']));
    }
};
