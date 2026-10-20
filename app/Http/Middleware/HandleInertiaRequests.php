<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Enquiry;
use App\Models\Page;
use App\Models\Setting;
use App\Support\AdminResources;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $isAdmin = $request->is('admin', 'admin/*');

        return array_merge(parent::share($request), [
            'settings' => fn () => Setting::allValues(),
            'flash' => fn () => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'auth' => fn () => ['user' => $request->user()?->only('id', 'name', 'email')],
            'menu' => $isAdmin ? null : fn () => [
                'categories' => Category::where('show_in_menu', true)->orderBy('sort_order')
                    ->with(['tours' => fn ($q) => $q->select('id', 'category_id', 'group_name', 'title', 'slug', 'duration_days')])
                    ->get(['id', 'name', 'slug', 'tagline', 'image']),
                'destinations' => Destination::orderBy('sort_order')->get(['id', 'name', 'slug', 'region', 'image']),
                'pages' => Page::where('is_published', true)->whereNotNull('footer_group')->orderBy('sort_order')->get(['title', 'menu_title', 'slug', 'footer_group']),
            ],
            'admin' => $isAdmin && $request->user() ? fn () => [
                'nav' => AdminResources::nav(),
                'newEnquiries' => Enquiry::where('status', 'new')->count(),
            ] : null,
        ]);
    }
}
