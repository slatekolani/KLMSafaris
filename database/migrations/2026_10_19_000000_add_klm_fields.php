<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->string('group_name')->nullable()->after('category_id');
            $table->string('departure')->nullable()->after('min_age');
            $table->string('departure_time')->nullable()->after('departure');
            $table->string('return_time')->nullable()->after('departure_time');
            $table->text('dress_code')->nullable()->after('return_time');
            $table->json('pricing')->nullable()->after('excludes');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->string('home_title')->nullable()->after('description');
            $table->string('home_text')->nullable()->after('home_title');
            $table->boolean('show_on_home')->default(true)->after('show_in_menu');
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->string('menu_title')->nullable()->after('footer_group');
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->string('subtitle')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('tours', fn (Blueprint $t) => $t->dropColumn(['group_name', 'departure', 'departure_time', 'return_time', 'dress_code', 'pricing']));
        Schema::table('categories', fn (Blueprint $t) => $t->dropColumn(['home_title', 'home_text', 'show_on_home']));
        Schema::table('pages', fn (Blueprint $t) => $t->dropColumn('menu_title'));
        Schema::table('partners', fn (Blueprint $t) => $t->dropColumn('subtitle'));
    }
};
