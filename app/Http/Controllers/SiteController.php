<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Enquiry;
use App\Models\Faq;
use App\Models\HeroSlide;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Post;
use App\Models\Setting;
use App\Models\Stat;
use App\Models\Subscriber;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\Tour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    private const CARD = ['id', 'category_id', 'group_name', 'title', 'slug', 'image', 'duration_days', 'price_from', 'season', 'badge', 'excerpt', 'difficulty'];

    private function tourCards($query)
    {
        return $query->published()->with('category:id,name,slug')->select(self::CARD);
    }

    public function home(): Response
    {
        $categories = Category::orderBy('sort_order')->withCount('tours')->get();
        $rows = $categories->where('show_on_home', true)->values()->map(function (Category $c) {
            $c->setAttribute('items', $this->tourCards(Tour::query())
                ->where('category_id', $c->id)
                ->orderByDesc('is_featured')->orderBy('sort_order')->take(8)->get());

            return $c;
        })->filter(fn ($c) => $c->items->isNotEmpty())->values();

        return Inertia::render('Home', [
            'slides' => HeroSlide::where('is_active', true)->orderBy('sort_order')->get(),
            'categories' => $categories,
            'rows' => $rows,
            'destinations' => Destination::where('is_featured', true)->orderBy('sort_order')->withCount('tours')->get(['id', 'name', 'slug', 'region', 'tagline', 'image']),
            'stats' => Stat::orderBy('sort_order')->get(),
            'testimonials' => Testimonial::where('is_active', true)->orderBy('sort_order')->get(),
            'partners' => Partner::orderBy('sort_order')->get(),
            'posts' => Post::published()->take(3)->get(['id', 'title', 'slug', 'topic', 'excerpt', 'image', 'read_minutes', 'published_at']),
            'counts' => [
                'tours' => Tour::published()->count(),
                'destinations' => Destination::count(),
                'categories' => $categories->count(),
            ],
        ]);
    }

    public function tours(Request $request): Response
    {
        $query = $this->tourCards(Tour::query());

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }
        if ($request->filled('destination')) {
            $query->whereHas('destinations', fn ($q) => $q->where('slug', $request->destination));
        }
        if ($request->filled('q')) {
            $query->where(fn ($w) => $w->where('title', 'like', "%{$request->q}%")->orWhere('excerpt', 'like', "%{$request->q}%"));
        }
        if ($request->filled('duration')) {
            [$min, $max] = array_map('intval', explode('-', $request->duration.'-999'));
            $query->whereBetween('duration_days', [$min, $max]);
        }
        if ($request->filled('budget')) {
            $query->where('price_from', '<=', (int) $request->budget);
        }

        $sort = $request->input('sort', 'recommended');
        match ($sort) {
            'price-asc' => $query->orderByRaw('price_from IS NULL, price_from asc'),
            'price-desc' => $query->orderByDesc('price_from'),
            'duration' => $query->orderBy('duration_days'),
            default => $query->orderByDesc('is_featured')->orderBy('sort_order'),
        };

        return Inertia::render('Tours/Index', [
            'tours' => $query->get(),
            'categories' => Category::orderBy('sort_order')->get(['id', 'name', 'slug']),
            'destinations' => Destination::orderBy('sort_order')->get(['id', 'name', 'slug']),
            'filters' => $request->only('category', 'destination', 'q', 'duration', 'budget', 'sort'),
        ]);
    }

    public function category(string $slug): Response
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        return Inertia::render('Category', [
            'category' => $category,
            'tours' => $this->tourCards($category->tours())->get(),
            'others' => Category::where('id', '!=', $category->id)->orderBy('sort_order')->get(),
            'faqs' => Faq::where('topic', $category->name)->orderBy('sort_order')->get(),
            'guides' => Page::where('is_published', true)->where('footer_group', $category->name)->orderBy('sort_order')->get(['id', 'title', 'slug', 'subtitle', 'image']),
        ]);
    }

    public function tour(string $slug): Response
    {
        $tour = Tour::published()->where('slug', $slug)->with(['category:id,name,slug', 'destinations:id,name,slug,image'])->firstOrFail();

        return Inertia::render('Tours/Show', [
            'tour' => $tour,
            'related' => $this->tourCards(Tour::query())
                ->where('id', '!=', $tour->id)
                ->where('category_id', $tour->category_id)
                ->orderByDesc('is_featured')->take(3)->get(),
            'testimonials' => Testimonial::where('is_active', true)->orderBy('sort_order')->take(4)->get(),
            'consultant' => TeamMember::where('is_consultant', true)->orderBy('sort_order')->first(),
        ]);
    }

    public function destinations(): Response
    {
        return Inertia::render('Destinations/Index', [
            'destinations' => Destination::orderBy('sort_order')->withCount('tours')->get(),
        ]);
    }

    public function destination(string $slug): Response
    {
        $destination = Destination::where('slug', $slug)->firstOrFail();

        return Inertia::render('Destinations/Show', [
            'destination' => $destination,
            'tours' => $this->tourCards($destination->tours())->get(),
            'others' => Destination::where('id', '!=', $destination->id)->orderBy('sort_order')->take(4)->get(['id', 'name', 'slug', 'image', 'region']),
        ]);
    }

    public function journal(Request $request): Response
    {
        $posts = Post::published()
            ->when($request->filled('topic'), fn ($q) => $q->where('topic', $request->topic))
            ->paginate(9, ['id', 'title', 'slug', 'topic', 'excerpt', 'image', 'author', 'read_minutes', 'published_at'])
            ->withQueryString();

        return Inertia::render('Journal/Index', [
            'posts' => $posts,
            'topics' => Post::published()->whereNotNull('topic')->distinct()->pluck('topic'),
            'topic' => $request->topic,
        ]);
    }

    public function post(string $slug): Response
    {
        $post = Post::published()->where('slug', $slug)->firstOrFail();

        return Inertia::render('Journal/Show', [
            'post' => $post,
            'more' => Post::published()->where('id', '!=', $post->id)->take(3)->get(['id', 'title', 'slug', 'topic', 'image', 'read_minutes', 'published_at']),
            'tours' => $this->tourCards(Tour::query())->where('is_featured', true)->inRandomOrder()->take(2)->get(),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Contact', [
            'faqs' => Faq::orderBy('sort_order')->take(6)->get(),
            'team' => TeamMember::orderBy('sort_order')->get(),
        ]);
    }

    public function plan(Request $request): Response
    {
        return Inertia::render('PlanTrip', [
            'categories' => Category::orderBy('sort_order')->get(['id', 'name', 'slug', 'image', 'tagline']),
            'destinations' => Destination::orderBy('sort_order')->get(['id', 'name', 'slug', 'image']),
            'tour' => $request->filled('tour') ? Tour::where('slug', $request->tour)->first(['id', 'title', 'slug', 'image', 'duration_days']) : null,
            'consultant' => TeamMember::where('is_consultant', true)->orderBy('sort_order')->first(),
        ]);
    }

    public function enquire(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:160',
            'phone' => 'nullable|string|max:40',
            'country' => 'nullable|string|max:80',
            'travel_date' => 'nullable|date',
            'adults' => 'nullable|integer|min:1|max:99',
            'children' => 'nullable|integer|min:0|max:99',
            'nights' => 'nullable|integer|min:1|max:90',
            'budget' => 'nullable|string|max:60',
            'interests' => 'nullable|array',
            'message' => 'nullable|string|max:5000',
            'tour_id' => 'nullable|exists:tours,id',
            'source' => 'nullable|string|max:30',
        ]);

        $enquiry = Enquiry::create(array_filter($data, fn ($v) => $v !== null) + ['source' => 'contact']);

        $to = Setting::allValues()['enquiry_email'] ?? null;
        if ($to) {
            try {
                Mail::raw("New enquiry #{$enquiry->id} from {$enquiry->name} <{$enquiry->email}>\n\n{$enquiry->message}", fn ($m) => $m->to($to)->subject('New KLM Safaris enquiry'));
            } catch (\Throwable $e) {
                Log::warning('Enquiry mail failed: '.$e->getMessage());
            }
        }

        return back()->with('success', 'Asante sana! Your enquiry is with our team — expect a personal reply within 24 hours.');
    }

    public function subscribe(Request $request)
    {
        $data = $request->validate(['email' => 'required|email|max:160']);
        Subscriber::firstOrCreate($data);

        return back()->with('success', 'Karibu! You are on the list for the Tanzania Travel Journal.');
    }

    public function page(string $slug): Response
    {
        $page = Page::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('Page', [
            'page' => $page,
            'team' => in_array($slug, ['about-klm-safaris', 'meet-our-team']) ? TeamMember::orderBy('sort_order')->get() : [],
            'faqs' => $slug === 'kilimanjaro-climbing-preparation' ? Faq::orderBy('sort_order')->get() : [],
        ]);
    }
}
