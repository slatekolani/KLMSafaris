<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscribers', function (Blueprint $table) {
            // Secret used in the one-click unsubscribe link in every newsletter email.
            $table->string('token', 64)->nullable()->unique()->after('email');
        });
        DB::table('subscribers')->whereNull('token')->orderBy('id')->each(
            fn ($row) => DB::table('subscribers')->where('id', $row->id)->update(['token' => Str::random(40)])
        );
    }

    public function down(): void
    {
        Schema::table('subscribers', function (Blueprint $table) {
            $table->dropColumn('token');
        });
    }
};
