<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin CMS
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [Admin\AuthController::class, 'show'])->name('login');
        Route::post('login', [Admin\AuthController::class, 'login'])->middleware('throttle:10,1');
    });

    Route::middleware('auth')->group(function () {
        Route::post('logout', [Admin\AuthController::class, 'logout'])->name('logout');
        Route::get('/', Admin\DashboardController::class)->name('dashboard');

        Route::get('settings', [Admin\SettingsController::class, 'edit'])->name('settings');
        Route::post('settings', [Admin\SettingsController::class, 'update']);

        Route::get('enquiries', [Admin\EnquiryController::class, 'index'])->name('enquiries');
        Route::put('enquiries/{enquiry}', [Admin\EnquiryController::class, 'update'])->name('enquiries.update');
        Route::delete('enquiries/{enquiry}', [Admin\EnquiryController::class, 'destroy'])->name('enquiries.destroy');
        Route::get('subscribers', [Admin\EnquiryController::class, 'subscribers'])->name('subscribers');
        Route::get('subscribers/export', [Admin\EnquiryController::class, 'exportSubscribers'])->name('subscribers.export');
        Route::delete('subscribers/{subscriber}', [Admin\EnquiryController::class, 'destroySubscriber'])->name('subscribers.destroy');

        Route::get('media', [Admin\MediaController::class, 'index'])->name('media');
        Route::post('media', [Admin\MediaController::class, 'store'])->name('media.store');
        Route::delete('media', [Admin\MediaController::class, 'destroy'])->name('media.destroy');

        Route::get('r/{resource}', [Admin\ResourceController::class, 'index'])->name('resource.index');
        Route::get('r/{resource}/create', [Admin\ResourceController::class, 'create'])->name('resource.create');
        Route::post('r/{resource}', [Admin\ResourceController::class, 'store'])->name('resource.store');
        Route::get('r/{resource}/{id}/edit', [Admin\ResourceController::class, 'edit'])->name('resource.edit');
        Route::put('r/{resource}/{id}', [Admin\ResourceController::class, 'update'])->name('resource.update');
        Route::post('r/{resource}/{id}/duplicate', [Admin\ResourceController::class, 'duplicate'])->name('resource.duplicate');
        Route::delete('r/{resource}/{id}', [Admin\ResourceController::class, 'destroy'])->name('resource.destroy');
    });
});

// Laravel's auth middleware redirects guests to the route named "login".
Route::get('login', fn () => redirect()->route('admin.login'))->name('login');

/*
|--------------------------------------------------------------------------
| Public site
|--------------------------------------------------------------------------
*/

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('tours', [SiteController::class, 'tours'])->name('tours');
Route::get('tours/{slug}', [SiteController::class, 'tour'])->name('tour');
Route::get('experiences/{slug}', [SiteController::class, 'category'])->name('category');
Route::get('destinations', [SiteController::class, 'destinations'])->name('destinations');
Route::get('destinations/{slug}', [SiteController::class, 'destination'])->name('destination');
Route::get('journal', [SiteController::class, 'journal'])->name('journal');
Route::get('journal/{slug}', [SiteController::class, 'post'])->name('post');
Route::get('contact', [SiteController::class, 'contact'])->name('contact');
Route::get('plan-your-trip', [SiteController::class, 'plan'])->name('plan');
Route::post('enquire', [SiteController::class, 'enquire'])->middleware('throttle:8,1')->name('enquire');
Route::post('subscribe', [SiteController::class, 'subscribe'])->middleware('throttle:8,1')->name('subscribe');

// CMS pages (About, Sustainability, Volunteer, Terms…) — keep last.
Route::get('{slug}', [SiteController::class, 'page'])->where('slug', '[a-z0-9\-]+')->name('page');
