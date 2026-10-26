<?php

namespace App\Http\Controllers;

use App\Mail\EnquiryConfirmation;
use App\Mail\EnquiryReceived;
use App\Mail\NewSubscriber;
use App\Mail\SubscriberWelcome;
use App\Models\Accommodation;
use App\Models\GalleryPhoto;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Enquiry;
use App\Models\Faq;
use App\Models\HeroSlide;
use App\Models\Page;
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
        $categories = Category::orderBy('sort_order')->withCount('tours')->withMin('tours', 'price_from')->get();
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
            // The homepage shows a selection; the rest are on /accommodation. Lodges with photos come first.
            'stays' => Accommodation::published()->with('destination:id,name')
                ->orderByRaw('(image IS NULL AND (gallery IS NULL OR JSON_LENGTH(gallery) = 0))')->orderBy('sort_order')->orderBy('name')
                ->take(8)->get(['id', 'name', 'slug', 'type', 'location', 'image', 'gallery', 'excerpt', 'destination_id']),
            'staysTotal' => Accommodation::published()->count(),
            // "All tours" tab: featured trips first, across every experience.
            'allTours' => $this->tourCards(Tour::query())->orderByDesc('is_featured')->orderBy('sort_order')->take(12)->get(),
            'destinations' => Destination::where('is_featured', true)->orderBy('sort_order')->withCount('tours')->get(['id', 'name', 'slug', 'region', 'tagline', 'image']),
            'stats' => Stat::orderBy('sort_order')->get(),
            'testimonials' => Testimonial::where('is_active', true)->orderBy('sort_order')->get(),
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
            'filters' => (object) $request->only('category', 'destination', 'q', 'duration', 'budget', 'sort'),
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

    public function tour(string $slug)
    {
        // Retired tours (e.g. merged duplicates) can send visitors to their replacement.
        $retired = Tour::where('slug', $slug)->where('is_published', false)->whereNotNull('redirect_to')->value('redirect_to');
        if ($retired) {
            return redirect($retired, 301);
        }
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

    public function stays(): Response
    {
        $stays = Accommodation::published()->with('destination:id,name,slug')
            ->orderByRaw('(image IS NULL AND (gallery IS NULL OR JSON_LENGTH(gallery) = 0))')->orderBy('sort_order')->orderBy('name')
            ->get(['id', 'name', 'slug', 'type', 'location', 'image', 'gallery', 'excerpt', 'destination_id']);

        return Inertia::render('Accommodation/Index', [
            'stays' => $stays,
            'types' => array_values(array_filter(Accommodation::TYPES, fn ($t) => $stays->contains('type', $t))),
        ]);
    }

    public function stay(string $slug): Response
    {
        $stay = Accommodation::published()->with('destination:id,name,slug')->where('slug', $slug)->firstOrFail();

        return Inertia::render('Accommodation/Show', [
            'stay' => $stay,
            // Other places to stay in the same area, then elsewhere.
            'more' => Accommodation::published()->with('destination:id,name')->where('id', '!=', $stay->id)
                ->orderByRaw('destination_id <=> ? DESC', [$stay->destination_id])->orderBy('sort_order')->take(4)
                ->get(['id', 'name', 'slug', 'type', 'location', 'image', 'gallery', 'destination_id']),
            'tours' => $stay->destination_id
                ? $this->tourCards(Tour::query()->whereHas('destinations', fn ($q) => $q->where('destinations.id', $stay->destination_id)))->take(3)->get()
                : [],
        ]);
    }

    public function gallery(): Response
    {
        $photos = GalleryPhoto::published()->orderBy('sort_order')->orderBy('id')->get(['id', 'image', 'caption', 'category']);
        $used = $photos->pluck('category')->unique();

        return Inertia::render('Gallery', [
            'photos' => $photos,
            // In the CMS order, keeping only categories that have photos.
            'categories' => array_values(array_filter(GalleryPhoto::CATEGORIES, fn ($c) => $used->contains($c))),
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
            'planner' => $this->plannerData(),
            'copy' => array_filter(Setting::allValues(), fn ($key) => str_starts_with($key, 'plan_'), ARRAY_FILTER_USE_KEY),
            'tour' => $request->filled('tour') ? Tour::published()->with('category:id,slug')->where('slug', $request->tour)->first(['id', 'category_id', 'title', 'slug', 'group_name', 'duration_days', 'difficulty']) : null,
            'consultant' => TeamMember::where('is_consultant', true)->orderBy('sort_order')->first(),
        ]);
    }

    /**
     * Everything the trip planner needs, derived from KLM's own published packages so that
     * routes, lengths and price guides always match what the company actually sells.
     */
    private function plannerData(): array
    {
        $tours = Tour::published()->with('category:id,slug', 'destinations:id,slug')->get();
        $in = fn (string $cat) => $tours->filter(fn (Tour $t) => $t->category?->slug === $cat);
        // Per-person price per day, as a [low, high] range across matching packages.
        $range = function ($set) {
            $rates = $set->filter(fn (Tour $t) => $t->price_from > 0 && $t->duration_days > 1)->map(fn (Tour $t) => $t->price_from / $t->duration_days)->sort()->values();
            return $rates->isEmpty() ? null : [(int) round($rates->first()), (int) round($rates->last())];
        };
        $card = fn (Tour $t) => ['id' => $t->id, 'title' => $t->title, 'slug' => $t->slug, 'image' => $t->image, 'days' => $t->duration_days, 'price' => $t->price_from, 'popular' => (bool) $t->is_featured];

        // Kilimanjaro & Meru: one entry per route, with each package length KLM offers.
        $climbs = $in('kilimanjaro')->filter(fn (Tour $t) => $t->duration_days >= 3 && $t->price_from > 0)
            ->sortBy('duration_days')->groupBy('group_name')
            ->map(fn ($set, $route) => ['route' => $route, 'options' => $set->map($card)->values()])
            // Kilimanjaro routes from gentlest price up; Mount Meru last, as the alternative peak.
            ->sortBy(fn ($r) => [$r['route'] === 'Mount Meru' ? 1 : 0, $r['options'][0]['price']])->values();

        // Multi-day safaris from Arusha (fly-in, Mwanza and southern packages price in flights).
        $safaris = $in('safari')->filter(fn (Tour $t) => $t->duration_days > 1 && ! in_array($t->group_name, ['Lake Victoria Safari', 'Fly-in Safari', 'Southern Safari', 'One-Day Park Safaris']));
        $styles = collect(['Camping', 'Lodge', 'Luxury'])->mapWithKeys(fn ($style) => [$style => [
            'rate' => $range($safaris->where('difficulty', $style)),
            'tours' => $safaris->where('difficulty', $style)->sortBy('duration_days')->map($card)->values(),
        ]]);

        $beach = $in('zanzibar')->filter(fn (Tour $t) => $t->duration_days > 1);
        $beachLuxury = $beach->filter(fn (Tour $t) => $t->difficulty === 'Luxury');

        return [
            'images' => Category::pluck('image', 'slug'),
            'climbs' => $climbs,
            // Parks offered in the planner, in driving order, with the days each one needs (set per destination in the CMS).
            'parks' => Destination::whereNotNull('planner_days')->where('planner_days', '>', 0)->orderBy('planner_order')->get(['slug', 'name', 'image', 'planner_days']),
            'safari' => $styles,
            'beach' => [
                'standard' => ['rate' => $range($beach->reject(fn (Tour $t) => $t->difficulty === 'Luxury')), 'tours' => $beach->reject(fn (Tour $t) => $t->difficulty === 'Luxury')->map($card)->values()],
                'luxury' => ['rate' => $range($beachLuxury), 'tours' => $beachLuxury->map($card)->values()],
            ],
            // Day trips around Moshi & Arusha (Lake Victoria and Zanzibar excursions belong to other legs).
            'dayTrips' => $in('day-tours')->filter(fn (Tour $t) => $t->price_from > 0 && ! $t->destinations->contains('slug', 'lake-victoria'))->sortBy('price_from')->map($card)->values(),
        ];
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
        $enquiry->load('tour:id,title,slug');

        // Team alert (reply goes straight to the guest) and the guest's own confirmation.
        $this->sendMail(fn () => Mail::to($this->teamInbox())->send(new EnquiryReceived($enquiry)), "enquiry #{$enquiry->id} alert");
        $this->sendMail(fn () => Mail::to($enquiry->email, $enquiry->name)->send(new EnquiryConfirmation($enquiry)), "enquiry #{$enquiry->id} confirmation");

        return back()->with('success', Setting::allValues()['ui_flash_enquiry']);
    }

    public function subscribe(Request $request)
    {
        $data = $request->validate(['email' => 'required|email|max:160']);
        $email = strtolower(trim($data['email']));

        if (Subscriber::where('email', $email)->exists()) {
            return back()->with('success', Setting::allValues()['ui_flash_already']);
        }

        $subscriber = Subscriber::create(['email' => $email]);
        $this->sendMail(fn () => Mail::to($subscriber->email)->send(new SubscriberWelcome($subscriber)), "subscriber #{$subscriber->id} welcome");
        $this->sendMail(fn () => Mail::to($this->teamInbox())->send(new NewSubscriber($subscriber)), "subscriber #{$subscriber->id} alert");

        return back()->with('success', str_replace('{email}', $subscriber->email, Setting::allValues()['ui_flash_subscribed']));
    }

    /** One-click unsubscribe from the link in every newsletter email. */
    public function unsubscribe(string $token)
    {
        $subscriber = Subscriber::where('token', $token)->first();
        $subscriber?->delete();

        return redirect('/')->with('success', Setting::allValues()[$subscriber ? 'ui_flash_unsubscribed' : 'ui_flash_unsub_used']);
    }

    /** Where team notifications go: CMS → Emails & notifications (several addresses can be comma-separated). */
    private function teamInbox(): array
    {
        $list = array_filter(array_map('trim', explode(',', (string) (Setting::allValues()['enquiry_email'] ?? ''))));

        return $list ?: [config('mail.from.address')];
    }

    /** Never let a mail problem lose a submission — it is already saved in the CMS; log the failure instead. */
    private function sendMail(callable $send, string $what): void
    {
        try {
            $send();
        } catch (\Throwable $e) {
            Log::error("Email failed ($what): ".$e->getMessage());
        }
    }

    public function page(string $slug)
    {
        $page = Page::where('slug', $slug)->first();
        // Retired pages can point visitors (and search engines) to their replacement.
        if ($page && ! $page->is_published && $page->redirect_to) {
            return redirect($page->redirect_to, 301);
        }
        abort_unless($page && $page->is_published, 404);

        return Inertia::render('Page', [
            'page' => $page,
            'team' => in_array($slug, ['about-klm-safaris', 'meet-our-team']) ? TeamMember::orderBy('sort_order')->get() : [],
            'faqs' => $slug === 'kilimanjaro-climbing-preparation' ? Faq::orderBy('sort_order')->get() : [],
        ]);
    }
}
