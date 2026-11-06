<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscribers', function (Blueprint $table) {
            $table->string('confirmation_token', 64)->nullable()->unique()->after('token');
            $table->timestamp('confirmed_at')->nullable()->after('confirmation_token');
        });

        // The old list predates double opt-in. Keep its recipients active rather
        // than silently dropping them from future newsletters.
        DB::table('subscribers')->whereNull('confirmed_at')->update(['confirmed_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('subscribers', function (Blueprint $table) {
            $table->dropUnique(['confirmation_token']);
            $table->dropColumn(['confirmation_token', 'confirmed_at']);
        });
    }
};
