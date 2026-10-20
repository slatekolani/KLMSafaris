<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Enquiry;
use App\Models\Post;
use App\Models\Subscriber;
use App\Models\Tour;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $months = collect(range(5, 0))->map(function ($ago) {
            $start = now()->startOfMonth()->subMonths($ago);

            return [
                'label' => $start->format('M'),
                'count' => Enquiry::whereBetween('created_at', [$start, $start->copy()->endOfMonth()])->count(),
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'counts' => [
                'newEnquiries' => Enquiry::where('status', 'new')->count(),
                'enquiries' => Enquiry::count(),
                'tours' => Tour::count(),
                'destinations' => Destination::count(),
                'posts' => Post::count(),
                'subscribers' => Subscriber::count(),
            ],
            'months' => $months,
            'recent' => Enquiry::with('tour:id,title')->latest()->take(6)->get(),
            'topTours' => Tour::withCount('enquiries')->orderByDesc('enquiries_count')->take(5)->get(['id', 'title', 'image']),
        ]);
    }
}
