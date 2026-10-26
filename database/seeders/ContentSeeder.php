<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Accommodation;
use App\Models\Faq;
use App\Models\GalleryPhoto;
use App\Models\HeroSlide;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Post;
use App\Models\Testimonial;
use App\Models\Tour;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds the CMS with KLM Safaris' existing website content (imported into database/seeders/data
 * by database/scripts/scrape-klmsafaris.php). Runs only on an empty database so it never
 * overwrites edits made in the CMS (`composer run dev` seeds on every start).
 */
class ContentSeeder extends Seeder
{
    /** Menu structure of klmsafaris.com: category → group → tour slugs. */
    private const MENU = [
        'kilimanjaro' => [
            'Lemosho Route' => ['kilimanjaro-6-days-lemosho-route', 'kilimanjaro-7-days-lemosho-route', 'kilimanjaro-8-days-lemosho-route'],
            'Machame Route' => ['kilimanjaro-6-days-machame-route', 'kilimanjaro-7-days-machame-route'],
            'Rongai Route' => ['kilimanjaro-6-days-rongai-route', 'kilimanjaro-7-days-rongai-route'],
            'Umbwe Route' => ['kilimanjaro-6-days-umbwe-route'],
            'Marangu Route' => ['kilimanjaro-5-days-marangu-route', 'kilimanjaro-6-days-marangu-route'],
            'Northern Circuit' => ['kilimanjaro-9-days-northern-circuit-route'],
            'Mount Meru' => ['mount-meru-climbing-3-days', 'mount-meru-climbing-4-days'],
            'Oldoinyo Lengai' => ['oldoinyo-lengai-mountain-trek'],
        ],
        'safari' => [
            'Popular Safaris' => ['tanzania-luxury-safari', '7-day-epic-luxury-safari-in-tanzania', 'family-safari', 'camping-safari', 'private-safari', '11-day-tanzania-safari-and-cultural-experiences'],
            'Short Day Safari' => ['2-day-lodge-safari', '3-day-lodge-safari', '3-day-lodge-safari-from-arusha', '5-day-lodge-safari', '7-day-lodge-safari'],
            'Migration Safari' => ['7-day-serengeti-migration-camping-safari-may-august', '7-day-serengeti-migration-lodge-safari-august-september'],
            'Fly-in Safari' => ['2-day-fly-from-zanzibar-lodge-safari', '2-day-zanzibar-selous-safari', '2-day-zanzibar-to-selous-safari', '3-day-zanzibar-to-ngorongoro-luxury-safari'],
            'Lake Victoria Safari' => ['2-day-lodge-safari-from-mwanza', '3-day-lodge-safari-from-mwanza', '4-day-lodge-safari-from-mwanza', '6-day-lodge-safari-from-mwanza', '7-day-lodge-safari-from-mwanza', 'rubondo-island-lake-victoria-3-days'],
            'Southern Safari' => ['9-days-tanzania-southern-safari-and-zanzibar-beach-tour', '14-days-tanzania-southern-safari-and-mafia-island-holiday-tour'],
            'One-Day Park Safaris' => ['1-day-to-ngorongoro-crater-tour', '1-day-tarangire-national-park-exploration', '1-day-to-lake-manyara-national-park', '1-day-arusha-national-park-exploration', '1-day-mkomazi-national-park-exploration'],
            'Special Safaris' => ['tanzania-children-safari', 'bar-mitzvah-african-safari'],
        ],
        'day-tours' => [
            'Hot Springs and Lakes' => ['kikuletwa-hot-spring-day-tour', 'lake-challa-day-trip-tour', 'guided-bike-tour-to-chemka-hot-springs'],
            'Waterfalls and Coffee' => ['materuni-water-falls', 'materuni-and-chemka', 'kibosho-village-tour', 'coffee-tasting-experience', 'napuru-waterfalls-coffee-tour-from-arusha'],
            'Wildlife and Nature' => ['serval-wildlife-sanctuary-tour-2', 'saanane-island-1-day'],
            'Culture Tours' => ['marangu-cultural-tours', 'olpopongi-maasai-cultural-village-tour', 'tanzanite-tour-in-tanzania'],
            'Mountain and Adventure' => ['mount-kilimanjaro-day-tour'],
        ],
        'zanzibar' => [
            'Zanzibar Holidays' => ['7-day-honeymoon-holiday', '4-days-zanzibar-beach-tour-exploration', '5-days-luxury-beach-tour-in-zanzibar', '6-days-zanzibar-beach-experience', '4-day-luxury-holiday'],
            'Zanzibar Day Tours' => ['stone-town-tour-zanzibar', 'spice-tour-zanzibar', 'prison-island-tour-zanzibar', 'nakupenda-beach-day-tour'],
        ],
    ];

    /** Free Pexels footage (Pexels licence) — replace with KLM's own clips in CMS → Hero Slides. */
    private const HERO_VIDEOS = [
        0 => 'https://videos.pexels.com/video-files/18435830/18435830-hd_1920_1080_30fps.mp4',
    ];

    /** Tours shown on the old homepage — featured first in each homepage row. */
    private const FEATURED = [
        'kilimanjaro-6-days-rongai-route', 'kilimanjaro-6-days-marangu-route', 'kilimanjaro-5-days-marangu-route', 'kilimanjaro-6-days-machame-route',
        'tanzania-luxury-safari', '7-day-epic-luxury-safari-in-tanzania', 'family-safari', 'camping-safari', 'private-safari',
        'stone-town-tour-zanzibar', 'spice-tour-zanzibar', 'prison-island-tour-zanzibar', 'nakupenda-beach-day-tour',
        'kikuletwa-hot-spring-day-tour', 'marangu-cultural-tours', 'lake-challa-day-trip-tour', 'materuni-water-falls',
    ];

    private function data(string $file): array
    {
        $path = database_path("seeders/data/$file.json");

        return is_file($path) ? json_decode(file_get_contents($path), true) : [];
    }

    private function k(string $file): string
    {
        return "/images/klm/$file";
    }

    public function run(): void
    {
        if (Tour::exists()) {
            return;
        }

        $assets = $this->data('assets');

        /* ---------------- Categories (top menu of klmsafaris.com) ---------------- */
        $cats = [];
        foreach ([
            ['Kilimanjaro', 'kilimanjaro', 'Discover the best routes to the Roof of Africa', 'Lemosho, Machame, Rongai, Umbwe, Marangu and the Northern Circuit — plus Mount Meru and Oldoinyo Lengai.', 'Popular Mount *Kilimanjaro* Trekking', '2016-04-Kilimanjaro-hiking-10.jpg'],
            ['Safari', 'safari', 'Lodge, camping, fly-in & migration safaris', 'Serengeti, Ngorongoro, Tarangire, Lake Manyara and Lake Victoria — short lodge safaris, migration safaris, fly-in safaris and family safaris.', 'Most Popular *Safaris*', '2016-11-Serengeti-National-Park4-1.jpg'],
            ['Day Tours', 'day-tours', 'Hot springs, waterfalls, coffee & culture', 'Short adventures from Moshi and Arusha: Chemka hot springs, Lake Chala, Materuni waterfalls, coffee tours and cultural villages.', 'Popular *Day Trips*', '2016-04-marangu-day-trip2-scaled.jpg'],
            ['Zanzibar', 'zanzibar', 'Beach holidays & island tours', 'Stone Town, spice farms, Prison Island, Nakupenda sandbank and beach holidays on the Indian Ocean.', 'Unforgettable *Zanzibar* Tours', '2024-11-prison-island2.jpg'],
        ] as $n => [$name, $slug, $tagline, $desc, $homeTitle, $img]) {
            $cats[$slug] = Category::create([
                'name' => $name, 'slug' => $slug, 'tagline' => $tagline, 'description' => $desc,
                'home_title' => $homeTitle, 'image' => $this->k($img), 'sort_order' => $n,
            ]);
        }

        /* ---------------- Destinations ----------------
         * The old site's destination pages are empty, so each destination is described with
         * KLM's own paragraphs that mention it (from their tours, pages and blog). */
        $corpus = [];
        foreach ([...$this->data('tours'), ...$this->data('pages'), ...$this->data('posts')] as $item) {
            $html = $item['overview'] ?? $item['body'] ?? '';
            if (preg_match_all('#<p>(.+?)</p>#s', $html, $m)) {
                foreach ($m[1] as $para) {
                    $plain = trim(html_entity_decode(strip_tags($para), ENT_QUOTES | ENT_HTML5));
                    if (mb_strlen($plain) > 140) {
                        $corpus[] = $plain;
                    }
                }
            }
        }
        $corpus = array_values(array_unique($corpus));
        $about = function (string $pattern, int $max = 3) use ($corpus): array {
            return array_slice(array_values(array_filter($corpus, fn ($p) => preg_match("/$pattern/i", $p))), 0, $max);
        };

        $dest = [];
        foreach ([
            ['Mount Kilimanjaro', 'kilimanjaro', 'Moshi · Kilimanjaro', 'The roof of Africa', 'Kilimanjaro|Uhuru', '2016-04-Kilimanjaro-hiking-10.jpg', ['2016-04-Kilimanjaro-climbing.jpg', '2016-04-lava-tower-kilimanjaro.jpg', '2016-11-kilimanjaro-day-trip-tours.jpg']],
            ['Serengeti National Park', 'serengeti', 'Northern circuit', 'Endless plains & the Great Migration', 'Serengeti', '2016-11-Serengeti-National-Park4-1.jpg', ['2016-11-Serengeti-Safari1.jpg', '2016-11-Serengeti-Safari3.jpg', '2016-11-Serengeti-National-Park2.jpg', '2016-11-Serengeti-Migration-Camp-May-–-August.jpg']],
            ['Ngorongoro Crater', 'ngorongoro', 'Northern circuit', 'The world’s largest intact caldera', 'Ngorongoro', '2024-11-ngorongorocrater-1.jpg', ['2019-01-Ngorongoro-Crater00.jpg', '2019-01-Ngorongoro-Crater1.jpg', '2019-01-Ngorongoro-Crater2.jpg']],
            ['Tarangire National Park', 'tarangire', 'Northern circuit', 'Baobabs and great elephant herds', 'Tarangire', '2016-11-Tarangire-national-park-10-scaled.jpg', ['2016-11-Tarangire-national-park-1-scaled.jpg', '2016-11-Tarangire-national-park-3-scaled.jpg', '2016-11-Tarangire-national-park-9-scaled.jpg']],
            ['Lake Manyara', 'lake-manyara', 'Northern circuit', 'Flamingos and tree-climbing lions', 'Manyara', '2016-11-Manyara-National-Park.jpg', ['2016-11-Lake-Manyara-National-Park01.jpg']],
            ['Arusha & Mount Meru', 'arusha', 'Northern Tanzania', 'Gateway to the northern parks', 'Arusha|Meru', '2019-01-Mount-Meru-4days.jpg', ['2019-01-Mount-Meru-4days1.jpg', '2019-01-Mount-Meru-4days3.jpg', '2016-11-Meru-4-days2.jpg']],
            ['Zanzibar', 'zanzibar', 'Indian Ocean', 'Spice island & white-sand beaches', 'Zanzibar|Stone Town', '2024-11-prison-island2.jpg', ['2024-11-zanzibar-spice-tour3.jpg', '2022-06-zanzibar-spice1.jpg', '2016-11-Zanzibar-Beach-000.jpg']],
            ['Lake Victoria', 'lake-victoria', 'Western Tanzania · Mwanza', 'Africa’s great lake & Rubondo Island', 'Victoria|Mwanza|Rubondo|Saanane', '2024-11-saanane-islands.jpg', ['2019-01-Rubondo-Island-National-park3.jpg', '2019-01-Saanane-Island-in-Lake-Victoria1.jpg']],
        ] as $n => [$name, $slug, $region, $tagline, $pattern, $img, $gallery]) {
            $paras = $about($pattern);
            $exists = fn (string $f) => is_file(public_path("images/klm/$f"));
            $dest[$slug] = Destination::create([
                'name' => $name, 'slug' => $slug, 'region' => $region, 'tagline' => $tagline,
                'excerpt' => $paras ? Str::limit($paras[0], 260) : null,
                'body' => $paras ? '<p>'.implode('</p><p>', array_map('e', $paras)).'</p>' : null,
                'image' => $exists($img) ? $this->k($img) : null,
                'gallery' => array_values(array_map(fn ($f) => $this->k($f), array_filter($gallery, $exists))),
                'sort_order' => $n,
            ]);
        }
        $destKeywords = ['serengeti' => 'serengeti', 'ngorongoro' => 'ngorongoro', 'tarangire' => 'tarangire', 'lake-manyara' => 'manyara', 'zanzibar' => 'zanzibar|stone town|prison island|nakupenda', 'arusha' => 'arusha|meru', 'lake-victoria' => 'victoria|mwanza|rubondo|saanane', 'kilimanjaro' => 'kilimanjaro|moshi|marangu|machame|materuni|chemka|kikuletwa|chala'];

        /* ---------------- Tours ---------------- */
        $lookup = [];
        foreach (self::MENU as $cat => $groups) {
            foreach ($groups as $group => $slugs) {
                foreach ($slugs as $i => $slug) {
                    $lookup[$slug] = [$cat, $group, $i];
                }
            }
        }

        foreach ($this->data('tours') as $n => $t) {
            [$cat, $group, $pos] = $lookup[$t['slug']] ?? $this->guess($t);
            $text = Str::lower($t['title'].' '.strip_tags($t['overview']).' '.($t['destination'] ?? ''));
            $style = match (true) {
                $cat === 'kilimanjaro' => $t['days'] >= 8 ? 'Moderate' : ($t['days'] <= 5 ? 'Challenging' : 'Moderate–challenging'),
                str_contains($text, 'luxury') => 'Luxury',
                str_contains($text, 'camping') => 'Camping',
                str_contains($text, 'lodge') => 'Lodge',
                default => null,
            };

            $tour = Tour::create([
                'category_id' => $cats[$cat]->id,
                'group_name' => $group,
                'title' => $t['title'],
                'slug' => $t['slug'],
                'excerpt' => Str::limit(trim(preg_replace('/\s+/', ' ', strip_tags($t['overview']))), 170),
                'overview' => $t['overview'] ?: (empty($t['draft']) ? null : '<p>This tour could not be imported from the old website (its page showed an error). Please add the overview, itinerary and photos, then publish it.</p>'),
                'duration_days' => max(1, (int) $t['days']),
                'price_from' => $t['price'] ?: null,
                'price_note' => $t['price_note'] ?: ($t['price'] ? 'per person' : null),
                'difficulty' => $style,
                'min_age' => $t['min_age'],
                'season' => $cat === 'kilimanjaro' ? 'Jan – Mar · Jun – Oct' : 'All year round',
                'departure' => $t['departure'],
                'departure_time' => $t['departure_time'],
                'return_time' => $t['return_time'],
                'dress_code' => $t['dress_code'],
                'image' => $t['image'] ?? ($t['gallery'][0] ?? null),
                'gallery' => $t['gallery'],
                'itinerary' => $t['itinerary'],
                'includes' => $t['includes'],
                'excludes' => $t['excludes'],
                'pricing' => $t['pricing'] ?: null,
                'is_featured' => in_array($t['slug'], self::FEATURED),
                // Tours that crash on the old site are imported unpublished for the team to complete.
                'is_published' => empty($t['draft']),
                'sort_order' => $pos + 10 * array_search($group, array_keys(self::MENU[$cat] ?? [$group => 0]) ?: 0),
                'meta_description' => $t['meta_description'],
            ]);

            $ids = [];
            foreach ($destKeywords as $slug => $re) {
                if (isset($dest[$slug]) && preg_match("/($re)/i", $text)) {
                    $ids[] = $dest[$slug]->id;
                }
            }
            $tour->destinations()->sync($ids);
        }

        /* ---------------- Hero slides (their homepage banners) ---------------- */
        foreach ([
            ['Serengeti · Ngorongoro · Kilimanjaro · Zanzibar', 'Journey with *KLM Safaris*', 'From the heights of Mount Kilimanjaro to the plains of Serengeti and the white sands of Zanzibar — the experience you long for.', '2019-01-Tarangire-National-Pack00.jpg', 'Explore tours', '/tours'],
            ['Kilimanjaro · 5,895 m', 'Climb Mount *Kilimanjaro*', 'Discover the best routes to the Roof of Africa with our experienced Moshi mountain crew.', '2016-04-Kilimanjaro-hiking-hero.jpg', 'Kilimanjaro routes', '/experiences/kilimanjaro'],
            ['Serengeti · Ngorongoro · Tarangire', 'Tanzania *Safaris*', 'Lodge, camping, fly-in and migration safaris across Tanzania’s legendary national parks.', '2016-11-Tarangire-national-park-3-hero.jpg', 'Tanzania safaris', '/experiences/safari'],
            ['Serengeti National Park', 'Serengeti *Migration*', 'Witness the breathtaking Serengeti Migration, where millions of animals embark on a spectacular journey.', '2016-04-hero-serengeti-migration.jpg', 'Migration safaris', '/tours?q=Migration'],
            ['Fly-in & helicopter', 'Helicopter *Safaris*', 'Catering for every need, prepared for any adventure — a safari built entirely around what you want.', '2016-04-hero-Helicopter-safari.jpeg', 'Fly-in safaris', '/tours?q=Fly'],
            ['Zanzibar archipelago', 'Zanzibar *Beach Holidays*', 'Stone Town, spice farms, Prison Island and the beautiful white sands of the Indian Ocean.', '2022-06-nakupenda-tours.jpg', 'Zanzibar tours', '/experiences/zanzibar'],
            ['Lodges · Tented camps · Beach hotels', 'Our *Accommodations*', 'Hand-picked lodges, tented camps and beach hotels across Tanzania — chosen for comfort, location and care.', '2016-04-hero-KLM-Luxury-Safari.jpg', 'Where you’ll stay', '/#accommodation'],
            ['Moshi · Tanzania', 'Planned by *local experts*', 'Planning and preparation are crucial to the success of a safari in Tanzania — our Moshi team takes care of every detail.', '2016-04-hero-ABD09822-scaled.jpg', 'Meet our team', '/about-klm-safaris'],
        ] as $n => [$eyebrow, $title, $sub, $img, $cta, $url]) {
            HeroSlide::create(['eyebrow' => $eyebrow, 'title' => $title, 'subtitle' => $sub, 'image' => $this->k($img), 'video' => self::HERO_VIDEOS[$n] ?? null,
                // Migration clip: keep only the wildlife (the last seconds show the vehicle's dashboard), in slow motion.
                'video_start' => $n === 0 ? 0 : null, 'video_end' => $n === 0 ? 11.5 : null, 'video_speed' => $n === 0 ? 0.6 : null, 'cta_label' => $cta, 'cta_url' => $url, 'sort_order' => $n]);
        }

        /* ---------------- Tripadvisor reviews (from the homepage widget) ---------------- */
        foreach (($this->data('reviews')['reviews'] ?? []) as $n => $r) {
            Testimonial::create([
                'name' => $r['name'], 'title' => $r['title'], 'quote' => $r['quote'], 'rating' => $r['rating'],
                'source' => 'Tripadvisor', 'trip' => $r['date'] ? date('F Y', $r['date']) : null, 'sort_order' => $n,
            ]);
        }

        /* ---------------- Partners & memberships ---------------- */
        foreach ([
            ['Yopal', null, null, 'https://www.yopal-me.com/'],
            ['TTB', 'Tanzania Tourist Board', 'ttb', 'https://www.tanzaniatourism.go.tz/'],
            ['TANAPA', 'Tanzania National Parks', 'tanapa', 'https://www.tanzaniaparks.go.tz/'],
            ['FDSA', 'Flying Doctors’ Society of Africa', 'fdsa', 'https://flydoc.org/'],
            ['JATA', 'Japan Association of Travel Agents', 'jata', 'https://www.jata-net.or.jp/'],
            ['WYSE', 'WYSE Travel Confederation', 'wyse', 'https://www.wysetc.org/'],
            ['STTA', 'Sustainable Travel and Tourism Agenda', 'stta', null],
            ['Traveller Storyteller', 'Encounters in Tourism', 'storyteller', null],
            ['Global Rescue', 'Safe Travel Partner', 'global_rescue_logo', 'https://www.globalrescue.com/'],
        ] as $n => [$name, $sub, $asset, $url]) {
            Partner::create(['name' => $name, 'subtitle' => $sub, 'logo' => $asset ? ($assets[$asset] ?? null) : $this->k(self::PARTNER_LOGOS[$name] ?? ''), 'url' => $url, 'sort_order' => $n]);
        }

        /* ---------------- Pages ---------------- */
        foreach ($this->data('pages') as $n => $p) {
            Page::create([
                'slug' => $p['slug'], 'title' => preg_replace('/-sample-DRAFT$/i', '', $p['menu_title'] ?: $p['title']), 'eyebrow' => $p['group'] === 'Legal' ? null : ($p['group'] === 'Volunteer' ? 'Volunteering' : $p['group']),
                'subtitle' => Str::limit(strip_tags($p['excerpt'] ?? ''), 220), 'image' => $this->photo($p['image'], $p['body'], $p['group']), 'body' => $p['body'],
                'footer_group' => $p['group'], 'menu_title' => $p['menu_title'], 'sort_order' => $n,
                // The old full-moon schedule page has headings but no dates yet.
                'is_published' => $p['slug'] !== 'kilimanjaro-full-moon-dates-schedule',
                'meta_description' => Str::limit(strip_tags($p['excerpt'] ?? ''), 160),
            ]);
        }

        /* ---------------- FAQs (Kilimanjaro climbing FAQ page) ---------------- */
        $faqPage = collect($this->data('pages'))->firstWhere('slug', 'klm-climbing-faq');
        if ($faqPage && preg_match_all('#<h[34]>(.+?)</h[34]>\s*((?:(?!<h[234]>).)+)#s', $faqPage['body'], $qa, PREG_SET_ORDER)) {
            foreach ($qa as $n => [, $q, $a]) {
                $answer = trim(html_entity_decode(strip_tags($a)));
                if (str_ends_with(trim(strip_tags($q)), '?') && $answer) {
                    Faq::create(['topic' => 'Kilimanjaro', 'question' => trim(strip_tags($q)), 'answer' => $answer, 'sort_order' => $n]);
                }
            }
        }

        /* ---------------- Blog ---------------- */
        foreach ($this->data('posts') as $p) {
            $title = $p['title'];
            $topic = match (true) {
                (bool) preg_match('/kilimanjaro|climb|route/i', $title) => 'Kilimanjaro',
                (bool) preg_match('/sustainab|plastic|impact/i', $title) => 'Sustainability',
                (bool) preg_match('/safari|game drive|balloon|bird/i', $title) => 'Safari',
                default => 'Travel tips',
            };
            Post::create([
                'title' => $title, 'slug' => $p['slug'], 'topic' => $topic,
                'excerpt' => Str::limit(strip_tags($p['excerpt'] ?? ''), 200),
                'body' => $p['body'], 'image' => $this->photo($p['image'], $p['body'], $topic), 'author' => 'KLM Safaris',
                'read_minutes' => max(2, (int) round(str_word_count(strip_tags($p['body'])) / 220)),
                'published_at' => $p['date'] ? date('Y-m-d H:i:s', strtotime($p['date'])) : now(),
            ]);
        }

        $this->destinationTexts();
        $this->betterHeroes();
        $this->tidyTours();
        $this->plannerParks();
        $this->volunteeringPage();
        $this->galleryPhotos();
        $this->accommodationsFromTours();
        $this->oldSiteLeftovers();
    }

    /**
     * The lodges, camps and hotels KLM's old tour itineraries name (the old accommodation pages were empty templates).
     * Only places with a real photo from the old site get one; the rest show "photo coming soon" until KLM adds photos.
     * [name, type, destination slug, location, cover, gallery]
     */
    private const LODGES = [
        ['Park View Inn', 'Hotel', 'kilimanjaro', 'Moshi town', null, []],
        ['Keys Hotel', 'Hotel', 'kilimanjaro', 'Moshi town', null, []],
        ['Kilimanjaro Wonders Hotel', 'Hotel', 'kilimanjaro', 'Moshi', null, []],
        ['Panama Garden Resort', 'Hotel', 'kilimanjaro', 'Moshi', null, []],
        ['Tulivu Kilimanjaro Retreat', 'Lodge', 'kilimanjaro', 'Kilimanjaro foothills', null, []],
        ['Kibo Palace Hotel', 'Hotel', 'arusha', 'Arusha city', null, []],
        ['Mount Meru Hotel', 'Hotel', 'arusha', 'Arusha city', null, []],
        ['Arusha Planet Lodge', 'Lodge', 'arusha', 'Arusha', null, []],
        ['Eileen’s Tree Inn', 'Lodge', 'ngorongoro', 'Karatu', null, []],
        ['Marera Valley Lodge', 'Lodge', 'ngorongoro', 'Karatu', null, []],
        ['Kitela Lodge', 'Lodge', 'ngorongoro', 'Karatu', '2024-04-Kitela-Lodge-Room-Sitting-Area.jpg', []],
        ['Rhino Lodge', 'Lodge', 'ngorongoro', 'Ngorongoro Conservation Area', null, []],
        ['Ngorongoro Serena Safari Lodge', 'Luxury lodge', 'ngorongoro', 'Ngorongoro Crater rim', null, []],
        ['Maramboi Tented Lodge', 'Tented camp', 'tarangire', 'Between Tarangire & Lake Manyara', null, []],
        ['Baobab Tented Camp', 'Tented camp', 'lake-manyara', 'Lake Manyara area', null, []],
        ['Mawe Tented Camp', 'Tented camp', 'serengeti', 'Serengeti National Park', '2016-11-mawe-1.jpg', ['2016-11-mawe-room-.jpg', '2016-11-mawe-bedroom.png', '2016-11-mawe-4.jpg', '2016-11-mawe-viti-nnje.png', '2016-11-mawe-waiter.png']],
        ['Serengeti Safari Camp', 'Tented camp', 'serengeti', 'Serengeti National Park', '2016-11-Serengeti-Safari-Camp-Serengeti-National-Park.jpg', []],
        ['Serengeti Heritage Tented Camp', 'Tented camp', 'serengeti', 'Serengeti National Park', null, []],
        ['Narudi Tented Camp', 'Tented camp', 'serengeti', 'Serengeti National Park', null, []],
        ['Malaika Beach Hotel', 'Hotel', 'lake-victoria', 'Mwanza, Lake Victoria', null, []],
        ['Beho Beho Camp', 'Luxury lodge', null, 'Nyerere National Park', null, []],
        ['Nyerere Tented Camp', 'Tented camp', null, 'Nyerere National Park', null, []],
        ['Ikaka Safari Camp', 'Tented camp', null, 'Ruaha National Park', null, []],
        ['Kinasi Lodge', 'Beach resort', null, 'Mafia Island', null, []],
        ['Zanzibar Serena Hotel', 'Hotel', 'zanzibar', 'Stone Town, Zanzibar', null, []],
        ['Royal Zanzibar Beach Resort', 'Beach resort', 'zanzibar', 'Nungwi, Zanzibar', null, []],
    ];

    public function accommodationsFromTours(): void
    {
        if (Accommodation::exists()) {
            return;
        }
        $dest = Destination::pluck('id', 'slug');
        $file = fn (?string $f): ?string => $f && is_file(public_path("images/klm/$f")) ? $this->k($f) : null;
        foreach (self::LODGES as $n => [$name, $type, $slug, $location, $cover, $gallery]) {
            Accommodation::create([
                'name' => $name, 'slug' => Str::slug($name), 'type' => $type,
                'destination_id' => $slug ? ($dest[$slug] ?? null) : null, 'location' => $location,
                'image' => $file($cover), 'gallery' => array_values(array_filter(array_map($file, $gallery))),
                'is_published' => true, 'sort_order' => $n,
            ]);
        }
    }

    /** Every KLM photo from the old site (media library, tour pages, sliders) — de-duplicated, without theme demo or stock images. */
    public function galleryPhotos(): void
    {
        if (GalleryPhoto::exists()) {
            return;
        }
        foreach ($this->data('gallery') as $n => $p) {
            GalleryPhoto::create(['image' => $p['image'], 'caption' => $p['caption'] ?: null, 'category' => $p['category'], 'sort_order' => $n]);
        }
    }

    /**
     * The old site's images for these were thumbnails, panoramic strips or too dark to sit behind a
     * full-screen hero — swap in KLM's own sharpest matching photo.
     */
    private const HERO_SWAPS = [
        Tour::class => [
            'tanzania-luxury-safari' => '2025-01-ABD09728-scaled.jpg',
            'family-safari' => '2023-12-kids-2.jpeg',
            'private-safari' => '2025-01-ABD09704-scaled.jpg',
            'camping-safari' => '2025-01-klm-safaris_env-scaled.jpg',
            'bar-mitzvah-african-safari' => '2024-11-Tarangire-national-park-15-scaled.jpg',
            '1-day-to-ngorongoro-crater-tour' => '2019-01-Ngorongoro-Crater.jpg',
            '1-day-to-lake-manyara-national-park' => '2016-11-Lake-Manyara-National-Park01.jpg',
            '3-day-lodge-safari-from-mwanza' => '2022-12-home-slide-1.jpg',
            '4-day-lodge-safari-from-mwanza' => '2019-01-Serengeti-National-Pack.jpg',
            '1-day-arusha-national-park-exploration' => '2016-11-Serengeti-National-Park0.jpg',
            '9-days-tanzania-southern-safari-and-zanzibar-beach-tour' => '2025-03-Mikumi_National_Park_024.jpg',
            '14-days-tanzania-southern-safari-and-mafia-island-holiday-tour' => '2025-03-Mikumi_National_Park_024.jpg',
            'kikuletwa-hot-spring-day-tour' => '2016-04-Chemka-hot-spring-5-scaled.jpg',
            'kibosho-village-tour' => '2024-11-kibosho-village.jpg',
            'spice-tour-zanzibar' => '2022-06-zanzibar-spice1.jpg',
            'coffee-tasting-experience' => '2025-01-arabica-cofee.jpg',
            'kilimanjaro-5-days-marangu-route' => '2016-04-how-much-is-kilimanjaro-park-fee.jpg',
            'oldoinyo-lengai-mountain-trek' => '2022-09-LENGAI.jpg',
            '2-day-fly-from-zanzibar-lodge-safari' => '2022-12-helicopter-zanzibar.jpg',
            'prison-island-tour-zanzibar' => '2024-11-prison-island2.jpg',
            'nakupenda-beach-day-tour' => '2022-06-safari-blue-2.jpg',
            '4-days-zanzibar-beach-tour-exploration' => '2022-06-zan-top.jpg',
            '5-days-luxury-beach-tour-in-zanzibar' => '2016-11-Zanzibar-tour-01.jpg',
            '6-days-zanzibar-beach-experience' => '2022-06-nakupenda-tours.jpg',
            'olpopongi-maasai-cultural-village-tour' => '2023-05-tourist_visiting_maasai_village_839_420shar-50brig-20_c1.jpg',
        ],
        Page::class => [
            'zanzibar-beach-holiday' => '2022-06-zan-top.jpg',
            'mount-meru-trekking' => '2019-01-Mount-Meru-4days.jpg',
            'tanzania-safari' => '2016-11-Tarangire-national-park-3-hero.jpg',
            'health-volunteering' => '2025-03-medical-health-volunteer.jpg',
            'sustainable-travel-3' => '2025-03-environmental-conservator.jpg',
            'childrens-home-support' => '2025-03-education-children.jpg',
            'education-volunteering-2' => '2025-03-children-mentor.jpg',
            'sports-and-games-volunteering' => '2025-03-children-sports.jpg',
            'internship-opportunity' => '2025-04-arrival-internship-scaled.jpg',
            'meet-our-team' => '2016-04-ABD09822-scaled.jpg',
        ],
        Post::class => [
            'night-game-drive-in-tanzania' => '2016-11-wanyama-testing.jpg',
            'accessible-tourism-in-tanzania' => '2025-01-ABD09704-scaled.jpg',
            'low-season-tour-in-tanzania' => '2016-11-Tarangire-national-park-10-scaled.jpg',
            'a-guide-for-health-and-safety-in-tanzania' => '2016-04-Global-Rescue-Image.jpg',
            'balloon-tour-in-tanzania' => '2019-01-Serengeti-National-Pack.jpg',
            'bird-watching-in-tanzania' => '2019-01-Rubondo-Island-National-park.jpg',
            'which-route-should-i-use-for-my-kilimanjaro-climb' => '2016-11-7-Days-Lemosho-route.jpg',
            'final-check-list-for-kilimanjaro-climb' => '2016-11-9-Days-Northern-circuit-route.jpg',
            'know-about-plastic-bags-ban-in-tanzania' => '2025-03-klm-brand.jpg',
            'kilimanjaro-helicopter-safaris' => '2022-12-helicopter-zanzibar.jpg',
        ],
    ];

    /** Northern-circuit parks offered in the trip planner: [recommended days, order on the route from Arusha]. */
    private const PLANNER_PARKS = ['arusha' => [1, 1], 'tarangire' => [1, 2], 'lake-manyara' => [1, 3], 'ngorongoro' => [1, 4], 'serengeti' => [2, 5]];

    /** What each destination is about, for picking KLM's own paragraphs: [slug => [own pattern, short name]]. */
    private const DESTINATION_TOPICS = [
        'kilimanjaro' => 'Kilimanjaro|Uhuru|Kibo|Machame|Marangu Route|Lemosho|Rongai|Umbwe',
        'serengeti' => 'Serengeti|Great Migration|wildebeest',
        'ngorongoro' => 'Ngorongoro|crater',
        'tarangire' => 'Tarangire|baobab',
        'lake-manyara' => 'Manyara',
        'arusha' => 'Arusha|Meru',
        'zanzibar' => 'Zanzibar|Stone Town|Prison Island|Nakupenda|spice',
        'lake-victoria' => 'Lake Victoria|Mwanza|Rubondo|Saanane',
    ];

    /**
     * Describe each destination with the old site's paragraphs that are really about it: a paragraph must name the
     * place more than once (or open with it), it goes only to the destination it fits best, and the summary ends on a
     * full sentence. Only rewrites destinations still carrying the old cut-off summary, so CMS edits are kept.
     */
    public function destinationTexts(): void
    {
        $count = fn (string $pattern, string $text) => preg_match_all("/(?:$pattern)/i", $text);
        $scores = [];
        foreach ($this->corpus() as $i => $para) {
            $first = preg_split('/(?<=[.!?])\s/', $para, 2)[0];
            $hits = array_map(fn ($rx) => $count($rx, $para), self::DESTINATION_TOPICS);
            arsort($hits);
            $best = array_key_first($hits);
            $others = count(array_filter($hits, fn ($n, $slug) => $n > 0 && $slug !== $best, ARRAY_FILTER_USE_BOTH));
            if (! $hits[$best] || $others > 2 || ($hits[$best] < 2 && ! $count(self::DESTINATION_TOPICS[$best], $first))) {
                continue;
            }
            $scores[$best][] = [$hits[$best] * 3 - $others * 2 + ($count(self::DESTINATION_TOPICS[$best], $first) ? 3 : 0), $i, $para];
        }

        foreach (Destination::all() as $d) {
            if (! preg_match('/(\.\.\.|…)\s*$/u', (string) $d->excerpt)) {
                continue;
            }
            $picked = collect($scores[$d->slug] ?? [])->sortByDesc(0)->take(3)->sortBy(1)->pluck(2)
                ->map(fn ($p) => preg_replace('/([a-z\)])\.([A-Z])/', '$1. $2', $p))->values();
            // Lead with a paragraph that opens by naming the place, so the summary is clearly about it.
            $opens = fn ($p) => (bool) preg_match('/(?:'.self::DESTINATION_TOPICS[$d->slug].')/i', preg_split('/(?<=[.!?])\s/', $p, 2)[0]);
            $picked = $picked->sortByDesc($opens)->values()->all();
            $d->update([
                'excerpt' => $picked ? $this->sentences($picked[0], 240) : null,
                'body' => $picked ? '<p>'.implode('</p><p>', array_map('e', $picked)).'</p>' : null,
            ]);
        }
    }

    /** As many whole sentences of $text as fit in $max characters (at least one). */
    private function sentences(string $text, int $max): string
    {
        $out = '';
        foreach (preg_split('/(?<=[.!?])\s+/', trim($text)) as $sentence) {
            if ($out !== '' && mb_strlen($out.' '.$sentence) > $max) {
                break;
            }
            $out = trim($out.' '.$sentence);
        }

        return $out;
    }

    /** KLM's own longer paragraphs from the old site's tours, pages and blog. */
    private function corpus(): array
    {
        $corpus = [];
        foreach ([...$this->data('tours'), ...$this->data('pages'), ...$this->data('posts')] as $item) {
            $html = $item['overview'] ?? $item['body'] ?? '';
            if (preg_match_all('#<p>(.+?)</p>#s', $html, $m)) {
                foreach ($m[1] as $para) {
                    $plain = trim(html_entity_decode(strip_tags($para), ENT_QUOTES | ENT_HTML5));
                    if (mb_strlen($plain) > 140) {
                        $corpus[] = $plain;
                    }
                }
            }
        }

        return array_values(array_unique($corpus));
    }

    /** Old-site blog posts missed by the first import: [slug => [topic, photo]]. The texts are in data/old-posts.json. */
    private const OLD_POSTS = [
        'family-safaris-in-tanzania' => ['Safari', '2023-12-kids-in-safaris.jpg'],
        'sustainable-travel-and-tourism-in-tanzania' => ['Sustainability', '2025-01-klm-safaris_env-scaled.jpg'],
    ];

    /**
     * What was still left on the old site (found by comparing every old page and post with the new site):
     * two blog posts, the Small Enterprise volunteering programme, the "Your Perfect Tanzania Holiday" landing page and
     * the internship application. Also retires two imported pages that only held theme demo text. Safe to run again.
     */
    public function oldSiteLeftovers(): void
    {
        $email = \App\Models\Setting::allValues()['email'] ?? 'info@klmsafaris.com';

        // 1. Blog posts
        foreach ($this->data('old-posts') as $slug => $p) {
            [$topic, $photo] = self::OLD_POSTS[$slug] ?? ['Travel tips', null];
            // Summaries skip a bold title line at the top of the article.
            $plain = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags(preg_replace('#^\s*<p><strong>.*?</strong></p>#s', '', $p['body'])), ENT_QUOTES | ENT_HTML5)));
            Post::firstOrCreate(['slug' => $slug], [
                'title' => $p['title'], 'topic' => $topic, 'body' => $p['body'],
                // The old posts' WordPress excerpts were theme placeholder text, so the summary comes from the article itself.
                'excerpt' => $this->sentences($plain, 200),
                'image' => $photo ? $this->k($photo) : null, 'author' => 'KLM Safaris',
                'read_minutes' => max(2, (int) round(str_word_count($plain) / 220)),
                'published_at' => date('Y-m-d H:i:s', strtotime($p['date'])), 'is_published' => true,
            ]);
        }

        // 2. Small Enterprise — the sixth programme on the Volunteering page
        $volunteering = Page::where('slug', 'volunteering')->first();
        if ($volunteering && ! collect($volunteering->sections ?? [])->contains('title', 'Small Enterprise')) {
            $volunteering->update([
                'subtitle' => 'Six ways to make a real difference with KLM Safaris — with children, in healthcare, in schools, for nature, through sport and with small businesses.',
                'sections' => [...($volunteering->sections ?? []), [
                    'title' => 'Small Enterprise',
                    'text' => 'Poverty, female discrimination and child labour hold many families back. With local NGOs we run small-enterprise projects in rural and urban Moshi and Arusha, where volunteers train groups in business skills — marketing, branding, record keeping, sales, accounting and quality product development — alongside local business experts. No special skills are needed: just an interest in entrepreneurship, gender equality and working with grassroots communities, especially women (18+).',
                    'points' => implode("\n", ['Female tailoring groups', 'Village community banks (VICOBA)', 'Brick making, dairy & horticulture groups', 'Honey keeping & retail shops', 'Tourism enterprises', 'Women & Entrepreneurship project in Masia, Marangu']),
                    'button_label' => 'Apply for this programme',
                    'button_url' => "mailto:$email?subject=".rawurlencode('Volunteer application – Small Enterprise'),
                    'image' => $this->k('2016-11-marangucultures.jpg'),
                ]],
            ]);
        }

        // 3. "Your Perfect Tanzania Holiday" — KLM's landing page with group prices and itinerary PDFs
        $pdf = fn (string $f) => "/files/itineraries/$f.pdf";
        $item = fn (string $name, string $price, ?string $tour, ?string $file) => '<li><strong>'.($tour ? '<a href="/tours/'.$tour.'">'.e($name).'</a>' : e($name)).'</strong> — '.e($price)
            .($file ? ' · <a href="'.$pdf($file).'" target="_blank" rel="noopener">Download itinerary (PDF)</a>' : '').'</li>';
        Page::firstOrCreate(['slug' => 'your-perfect-tanzania-holiday'], [
            'title' => 'Your Perfect *Tanzania* Holiday',
            'eyebrow' => 'Tanzania holidays',
            'subtitle' => 'Climb Kilimanjaro, follow the Great Migration and unwind on Zanzibar — our selected packages at group prices.',
            'image' => $this->k('2023-02-migration.jpg'),
            'body' => '<p>Tanzania is the most captivating country in Africa, known for its breathtaking beauty and friendly people. Enriched with its stunning landscapes, diverse wildlife, picturesque beaches, historic towns, ancient sites, and remarkable geological formations, it truly is a visual perfection.</p>'
                .'<p>One of the country’s most iconic features is certainly Mount Kilimanjaro, the highest mountain in Africa. Rising majestically from the lush, green plains, its snow-capped peak is a truly awe-inspiring sight. Surprisingly, climbing Kilimanjaro is relatively easy, and reaching the summit offers the unique climax of an epic adventure.</p>'
                .'<p>Tanzania is an ideal destination for those seeking both adventure and relaxation. Here you can witness the incredible Great Migration, where vast herds of animals traverse the Serengeti plains, offering a truly unforgettable experience. And after an exhilarating safari, visitors can unwind on the serene beaches of Zanzibar, a captivating and exotic Spice Island which provides utterly wonderful leisure options.</p>'
                .'<h2>Our selected safari packages</h2><ul>'
                .$item('2-Days Tanzania National Park Safari', 'from $455 pp for 6+ people', '2-day-lodge-safari', '2-Days-Tanzania-safari')
                .$item('5 Days Tanzania Budget Safari in Serengeti, Ngorongoro and Tarangire', 'from $1,200 pp for 4–6 people', null, '5-Days-Tanzania-Budget-Safari-in-Serengeti-Ngorongoro-and-Tarangire-National-Parks')
                .$item('5 Days Tanzania Midrange Safari in Serengeti, Ngorongoro and Tarangire', 'from $1,300 pp for 6+ people', null, '5-Days-Tanzania-Midrange-Safari-in-Serengeti-Ngorongoro-and-Tarangire-National-Parks')
                .$item('7-Day Inclusive Luxury Epic Safari in Tanzania', 'from $3,000 pp for 6+ people', null, null)
                .$item('11-Day Tanzania Safari and Cultural Experiences', 'from $3,850 pp for 6+ people', '11-day-tanzania-safari-and-cultural-experiences', '11-Day-Tanzania-Safari-and-Cultural-Experiences')
                .'</ul><h2>Our selected Kilimanjaro packages</h2><ul>'
                .$item('6-Days Marangu Route Trek', 'from $1,550 pp for 10+ people', 'kilimanjaro-6-days-marangu-route', 'Marangu-6-Days-_KLM-Safaris')
                .$item('6-Days Machame Route Trek', 'from $1,650 pp for 10+ people', 'kilimanjaro-6-days-machame-route', 'Machame-Six-Days-_KLM-Safaris')
                .$item('6-Days Rongai Route Trek', 'from $1,650 pp for 10+ people', 'kilimanjaro-6-days-rongai-route', 'Rongai-Six-Days_KLM-Safaris')
                .$item('7-Days Lemosho Route Trek', 'from $1,490 pp for 10+ people', 'kilimanjaro-7-days-lemosho-route', 'Lemosho-Seven-Days_KLM-Safaris')
                .$item('7-Days Kilimanjaro Bike Tour, Marangu', 'from $2,450 pp for 10+ people', null, 'Kilimanjaro-Bike-Tour_KLM-Safaris')
                .'</ul>',
            'cta_title' => 'Need more info? Send us a message!',
            'cta_text' => 'Tell us which package caught your eye, your dates and group size — our Moshi team will reply personally.',
            'cta_label' => 'Send us a message',
            'cta_url' => '/contact',
            'is_published' => true,
        ]);

        // 4. Internship application — the old site had a separate form page; now a direct way to apply
        Page::where('slug', 'internship-opportunity')->whereNull('cta_url')->update([
            'cta_title' => 'Apply for an internship',
            'cta_text' => 'Tell us which area interests you — digital marketing strategies, content creation, brand management, or market research and analytics — and attach your CV and a short cover letter.',
            'cta_label' => 'Apply by email',
            'cta_url' => "mailto:$email?subject=".rawurlencode('Internship application'),
        ]);

        // 5. Imported pages that only held the old theme's demo text (made-up staff, Lorem Ipsum terms)
        Page::where('slug', 'meet-our-team')->update(['is_published' => false, 'redirect_to' => '/about-klm-safaris']);
        Page::where('slug', 'terms-and-conditions')->update(['is_published' => false, 'redirect_to' => '/booking-terms-and-conditions']);
    }

    /** Partner logos that were not on the old site, kept in public/images/klm. */
    private const PARTNER_LOGOS = ['Yopal' => 'yopal-logo.png'];

    /** The old site had one page per volunteer programme; they are summarised on a single page. */
    private const VOLUNTEER_PAGES = ['childrens-home-support', 'health-volunteering', 'education-volunteering-2', 'environment-conservation', 'sports-and-games-volunteering', 'apply-to-volunteer'];

    public function volunteeringPage(): void
    {
        $email = \App\Models\Setting::allValues()['email'] ?? 'info@klmsafaris.com';
        $apply = fn (string $programme) => "mailto:$email?subject=".rawurlencode("Volunteer application – $programme");
        $block = fn (string $title, string $text, array $points, string $image) => [
            'title' => $title, 'text' => $text, 'points' => implode("\n", $points),
            'button_label' => 'Apply for this programme', 'button_url' => $apply($title), 'image' => $this->k($image),
        ];

        Page::updateOrCreate(['slug' => 'volunteering'], [
            'title' => 'Volunteer in *Tanzania*',
            'eyebrow' => 'Volunteering',
            'menu_title' => 'Volunteering',
            'footer_group' => 'Volunteer',
            'subtitle' => 'Six ways to make a real difference with KLM Safaris — with children, in healthcare, in schools, for nature, through sport and with small businesses.',
            'image' => $this->k('2025-03-education-children.jpg'),
            'body' => '<p>KLM Safaris connects volunteers with communities in and around Moshi, at the foot of Mount Kilimanjaro. Choose the programme that fits your skills and passion — every placement is arranged and supported by our local team.</p>'
                .'<h3>How it works</h3><ol><li>Choose a programme below.</li><li>Email your CV and a short cover letter telling us what motivates you.</li><li>We match you with the right placement and confirm the details with you.</li></ol>',
            'sections' => [
                $block('Children’s Home Support', 'Care for orphaned and vulnerable children in local children’s homes — giving them routine, learning and the friendship that builds confidence. Open to anyone who loves working with children: students, professionals and retirees.', ['Daily childcare and play', 'Tutoring in English, maths and science', 'Health and hygiene education', 'Mentoring and emotional support', 'Administration and fundraising'], '2025-03-education-children.jpg'),
                $block('Health Volunteering', 'Work alongside Tanzanian health workers in hospitals, health centres and dispensaries. We match each volunteer to a placement where their skills make the biggest impact. For medical professionals and anyone passionate about community health.', ['Public health campaigns — HIV, malaria, nutrition', 'Clinical services with local teams', 'Community health outreach', 'Training and capacity building', 'Maternal and child health'], '2025-03-medical-health-volunteer.jpg'),
                $block('Education Volunteering', 'Support schools facing crowded classrooms, limited resources and teacher shortages — especially in rural communities. Teaching experience helps, but a passion for learning matters most.', ['Teaching literacy, maths, English, science and IT', 'Teacher training and mentoring', 'Special needs education', 'Early childhood education', 'School building and improvement projects'], '2025-03-children-mentor.jpg'),
                $block('Environment Conservation', 'Help protect the landscapes and wildlife of Kilimanjaro, the Serengeti and beyond — working with local communities against deforestation, poaching, soil erosion and climate change. No experience required, just a love of nature.', ['Wildlife conservation', 'Reforestation and tree planting', 'Research and data collection', 'Environmental education and community outreach'], '2025-03-environmental-conservator.jpg'),
                $block('Sports and Games', 'Coach and inspire young talent in communities where qualified coaches, facilities and playgrounds are scarce. For athletes, coaches, students and retirees who want to empower children through sport.', ['Coaching football, basketball, athletics, volleyball and netball', 'PE classes and teacher training', 'Improving sports facilities and playgrounds', 'Inclusive sports for children with disabilities', 'Life skills through sport'], '2025-03-children-sports.jpg'),
            ],
            'cta_title' => 'Ready to volunteer with KLM Safaris?',
            'cta_text' => 'Send your CV and a short cover letter telling us what motivates you — our team will reply and match you with the right placement.',
            'cta_label' => 'Apply by email',
            'cta_url' => "mailto:$email?subject=".rawurlencode('Volunteer application'),
            'is_published' => true,
            'sort_order' => 0,
        ]);

        // Retire the old per-programme pages but keep their links working.
        Page::whereIn('slug', self::VOLUNTEER_PAGES)->update(['is_published' => false, 'redirect_to' => '/volunteering']);
    }

    /** Trips the old site published twice under different slugs: [duplicate slug => the tour to keep]. */
    private const DUPLICATE_TOURS = [
        '2-day-zanzibar-selous-safari' => '2-day-zanzibar-to-selous-safari',
        // Same 10-day itinerary and price as the Family Safari, offered as a themed variant.
        'bar-mitzvah-african-safari' => 'family-safari',
    ];

    /** Remove duplicates: merged tours are unpublished with a redirect, and cover photos are not repeated in galleries. */
    public function tidyTours(): void
    {
        foreach (self::DUPLICATE_TOURS as $duplicate => $keep) {
            Tour::where('slug', $duplicate)->update(['is_published' => false, 'redirect_to' => "/tours/$keep"]);
        }
        foreach (Tour::whereNotNull('gallery')->get() as $tour) {
            $gallery = array_values(array_unique(array_filter($tour->gallery ?? [], fn ($img) => $img && $img !== $tour->image)));
            if ($gallery !== ($tour->gallery ?? [])) {
                $tour->update(['gallery' => $gallery]);
            }
        }
    }

    public function plannerParks(): void
    {
        foreach (self::PLANNER_PARKS as $slug => [$days, $order]) {
            Destination::where('slug', $slug)->update(['planner_days' => $days, 'planner_order' => $order]);
        }
    }

    public function betterHeroes(): void
    {
        foreach (self::HERO_SWAPS as $model => $map) {
            foreach ($map as $slug => $file) {
                $model::where('slug', $slug)->update(['image' => $this->k($file)]);
            }
        }
    }

    /** The old site used its logo as the share image on many pages — prefer a real photo. */
    private function photo(?string $image, string $body, string $group): ?string
    {
        if ($image && ! preg_match('/logo/i', $image)) {
            return $image;
        }
        if (preg_match_all('#<img src="([^"]+)"#', $body, $m)) {
            foreach ($m[1] as $src) {
                if (! preg_match('/logo|icon/i', $src)) {
                    return $src;
                }
            }
        }
        $fallback = [
            'Kilimanjaro' => '2016-04-how-much-is-kilimanjaro-park-fee.jpg',
            'Sustainability' => '2025-01-klm-safaris_env-scaled.jpg',
            'Volunteer' => '2025-03-education-children.jpg',
            'About' => '2025-03-klm-brand.jpg',
            'Safari' => '2016-11-Serengeti-National-Park4-1.jpg',
        ][$group] ?? '2016-11-Bunner01-2.jpg';

        return $this->k($fallback);
    }

    /** Fallback placement for tours not in the old menu. */
    private function guess(array $t): array
    {
        $s = $t['slug'].' '.Str::lower($t['title']);

        return match (true) {
            (bool) preg_match('/kilimanjaro|meru|lengai/', $s) && ! str_contains($s, 'day-tour') => ['kilimanjaro', 'Kilimanjaro', 99],
            (bool) preg_match('/zanzibar|beach/', $s) && ! str_contains($s, 'safari') => ['zanzibar', 'Zanzibar Holidays', 99],
            (int) $t['days'] <= 1 => ['day-tours', 'More Day Tours', 99],
            default => ['safari', 'More Safaris', 99],
        };
    }
}
