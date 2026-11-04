<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // New and changed tours, posts and pages are announced to search engines (see App\Support\IndexNow).
        \App\Support\IndexNow::watch();
    }
}
