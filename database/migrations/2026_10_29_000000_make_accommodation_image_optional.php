<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Lodges can be listed before KLM has photos of them — the site shows "photo coming soon" instead.
    public function up(): void
    {
        Schema::table('accommodations', function (Blueprint $table) {
            $table->string('image')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('accommodations', function (Blueprint $table) {
            $table->string('image')->nullable(false)->change();
        });
    }
};
