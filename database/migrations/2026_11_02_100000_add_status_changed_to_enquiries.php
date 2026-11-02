<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Who last changed an enquiry's status, and when, so every admin sees the same progress. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enquiries', function (Blueprint $table) {
            $table->string('status_changed_by')->nullable()->after('status');
            $table->timestamp('status_changed_at')->nullable()->after('status_changed_by');
        });
    }

    public function down(): void
    {
        Schema::table('enquiries', function (Blueprint $table) {
            $table->dropColumn(['status_changed_by', 'status_changed_at']);
        });
    }
};
