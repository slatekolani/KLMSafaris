<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->string('video')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('hero_slides', fn (Blueprint $t) => $t->dropColumn('video'));
    }
};
