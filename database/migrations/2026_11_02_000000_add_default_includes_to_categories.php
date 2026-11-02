<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Each category keeps a default "What's included / Not included" list that new tours in it start from. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->json('includes')->nullable()->after('description');
            $table->json('excludes')->nullable()->after('includes');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['includes', 'excludes']);
        });
    }
};
