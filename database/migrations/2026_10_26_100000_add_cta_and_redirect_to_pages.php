<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            // Closing call to action (falls back to “Plan your trip” when empty).
            $table->string('cta_title')->nullable();
            $table->text('cta_text')->nullable();
            $table->string('cta_label')->nullable();
            $table->string('cta_url')->nullable();
            // Where visitors go when this page is unpublished (keeps old links working).
            $table->string('redirect_to')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['cta_title', 'cta_text', 'cta_label', 'cta_url', 'redirect_to']);
        });
    }
};
