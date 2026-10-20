<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Faq;
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
        1 => 'https://videos.pexels.com/video-files/8334109/8334109-hd_2048_1080_25fps.mp4',
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
            ['Serengeti · Ngorongoro · Kilimanjaro · Zanzibar', 'Journey with *KLM Safaris*', 'From the heights of Mount Kilimanjaro to the plains of Serengeti and the white sands of Zanzibar — the experience you long for.', '2016-11-Serengeti-National-Park4-1.jpg', 'Explore tours', '/tours'],
            ['Kilimanjaro · 5,895 m', 'Climb Mount *Kilimanjaro*', 'Discover the best routes to the Roof of Africa with our experienced Moshi mountain crew.', '2016-04-Kilimanjaro-hiking-10.jpg', 'Kilimanjaro routes', '/experiences/kilimanjaro'],
            ['Serengeti · Ngorongoro · Tarangire', 'Tanzania *Safaris*', 'Lodge, camping, fly-in and migration safaris across Tanzania’s legendary national parks.', '2016-11-Serengeti-National-Park4-1.jpg', 'Tanzania safaris', '/experiences/safari'],
            ['Zanzibar archipelago', 'Zanzibar *Beach Holidays*', 'Stone Town, spice farms, Prison Island and the beautiful white sands of the Indian Ocean.', '2024-11-prison-island2.jpg', 'Zanzibar tours', '/experiences/zanzibar'],
        ] as $n => [$eyebrow, $title, $sub, $img, $cta, $url]) {
            HeroSlide::create(['eyebrow' => $eyebrow, 'title' => $title, 'subtitle' => $sub, 'image' => $this->k($img), 'video' => self::HERO_VIDEOS[$n] ?? null, 'cta_label' => $cta, 'cta_url' => $url, 'sort_order' => $n]);
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
            ['TTB', 'Tanzania Tourist Board', 'ttb', 'https://www.tanzaniatourism.go.tz/'],
            ['TANAPA', 'Tanzania National Parks', 'tanapa', 'https://www.tanzaniaparks.go.tz/'],
            ['FDSA', 'Flying Doctors’ Society of Africa', 'fdsa', 'https://flydoc.org/'],
            ['JATA', 'Japan Association of Travel Agents', 'jata', 'https://www.jata-net.or.jp/'],
            ['WYSE', 'WYSE Travel Confederation', 'wyse', 'https://www.wysetc.org/'],
            ['STTA', 'Sustainable Travel and Tourism Agenda', 'stta', null],
            ['Traveller Storyteller', 'Encounters in Tourism', 'storyteller', null],
            ['Global Rescue', 'Safe Travel Partner', 'global_rescue_logo', 'https://www.globalrescue.com/'],
        ] as $n => [$name, $sub, $asset, $url]) {
            Partner::create(['name' => $name, 'subtitle' => $sub, 'logo' => $assets[$asset] ?? null, 'url' => $url, 'sort_order' => $n]);
        }

        /* ---------------- Pages ---------------- */
        foreach ($this->data('pages') as $n => $p) {
            Page::create([
                'slug' => $p['slug'], 'title' => preg_replace('/-sample-DRAFT$/i', '', $p['menu_title'] ?: $p['title']), 'eyebrow' => $p['group'] === 'Legal' ? null : ($p['group'] === 'Volunteer' ? 'Volunteering' : $p['group']),
                'subtitle' => Str::limit(strip_tags($p['excerpt'] ?? ''), 220), 'image' => $this->photo($p['image'], $p['body'], $p['group']), 'body' => $p['body'],
                'footer_group' => $p['group'], 'menu_title' => $p['menu_title'], 'sort_order' => $n,
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
