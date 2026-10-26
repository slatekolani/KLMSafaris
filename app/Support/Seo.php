<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Str;

/**
 * Search & share tags for every public page, worked out on the server from the Inertia page (component + props),
 * so Google, WhatsApp, Facebook, LinkedIn and X read them without running JavaScript. Texts come from the CMS:
 * each record's own meta fields first, then its title/summary/photo, then the page header settings, then the SEO defaults.
 */
class Seo
{
    /** List pages whose title/text/photo come from their header settings (CMS → Site settings → Page headers). */
    private const HEADERS = [
        'Tours/Index' => 'tours_hero',
        'Destinations/Index' => 'destinations_hero',
        'Journal/Index' => 'journal_hero',
        'Accommodation/Index' => 'stays_hero',
        'Gallery' => 'gallery_hero',
        'Contact' => 'contact_hero',
    ];

    public static function fromPage(array $page): array
    {
        $s = Setting::allValues();
        $site = $s['site_name'] ?: 'KLM Safaris';
        $c = $page['component'] ?? '';
        $p = $page['props'] ?? [];
        $get = fn (string $key) => data_get($p, $key);

        $seo = ['title' => null, 'description' => null, 'image' => null, 'type' => 'website', 'robots' => 'index,follow', 'schema' => []];

        if (str_starts_with($c, 'Admin/')) {
            return self::finish(['title' => 'Admin', 'robots' => 'noindex,nofollow'] + $seo, $s, $site, $page);
        }

        switch (true) {
            case $c === 'Home':
                $seo['title'] = $s['seo_home_title'] ?: $site;
                $seo['image'] = $s['og_home_image'] ?: $s['logo'];
                $seo['schema'][] = ['@type' => 'WebSite', 'name' => $site, 'url' => url('/')];
                break;

            case isset(self::HEADERS[$c]):
                $h = self::HEADERS[$c];
                $seo['title'] = $s["{$h}_title"] ?? null;
                $seo['description'] = $s["{$h}_text"] ?? null;
                $seo['image'] = $s["{$h}_image"] ?? null;
                break;

            case $c === 'PlanTrip':
                $seo['title'] = $s['seo_plan_title'];
                $seo['description'] = $s['seo_plan_description'];
                $seo['image'] = $s['plan_image'] ?? null;
                break;

            case $c === 'Tours/Show':
                $t = $get('tour');
                $seo['title'] = data_get($t, 'meta_title') ?: data_get($t, 'title');
                $seo['description'] = data_get($t, 'meta_description') ?: data_get($t, 'excerpt') ?: data_get($t, 'overview');
                $seo['image'] = data_get($t, 'image');
                $seo['schema'][] = array_filter([
                    '@type' => 'TouristTrip',
                    'name' => data_get($t, 'title'),
                    'description' => self::text(data_get($t, 'excerpt') ?: data_get($t, 'overview'), 300),
                    'image' => self::abs(data_get($t, 'image')),
                    'touristType' => data_get($t, 'category.name'),
                    'provider' => ['@type' => 'TravelAgency', 'name' => $site, 'url' => url('/')],
                    'offers' => data_get($t, 'price_from') ? ['@type' => 'Offer', 'price' => (string) data_get($t, 'price_from'), 'priceCurrency' => 'USD', 'url' => url()->current()] : null,
                ]);
                break;

            case $c === 'Category':
                $cat = $get('category');
                $seo['title'] = str_replace('*', '', (string) (data_get($cat, 'home_title') ?: data_get($cat, 'name')));
                $seo['description'] = data_get($cat, 'description') ?: data_get($cat, 'tagline');
                $seo['image'] = data_get($cat, 'image');
                break;

            case $c === 'Destinations/Show':
                $d = $get('destination');
                $seo['title'] = data_get($d, 'name');
                $seo['description'] = data_get($d, 'excerpt') ?: data_get($d, 'tagline');
                $seo['image'] = data_get($d, 'image');
                $seo['schema'][] = array_filter(['@type' => 'TouristDestination', 'name' => data_get($d, 'name'), 'description' => self::text(data_get($d, 'excerpt'), 300), 'image' => self::abs(data_get($d, 'image'))]);
                break;

            case $c === 'Journal/Show':
                $post = $get('post');
                $seo['title'] = data_get($post, 'title');
                $seo['description'] = data_get($post, 'excerpt') ?: data_get($post, 'body');
                $seo['image'] = data_get($post, 'image');
                $seo['type'] = 'article';
                $seo['published'] = data_get($post, 'published_at');
                $seo['schema'][] = array_filter([
                    '@type' => 'BlogPosting',
                    'headline' => data_get($post, 'title'),
                    'description' => self::text(data_get($post, 'excerpt'), 300),
                    'image' => self::abs(data_get($post, 'image')),
                    'datePublished' => data_get($post, 'published_at'),
                    'author' => ['@type' => 'Organization', 'name' => data_get($post, 'author') ?: $site],
                    'publisher' => ['@type' => 'Organization', 'name' => $site, 'logo' => ['@type' => 'ImageObject', 'url' => self::abs($s['logo'])]],
                    'mainEntityOfPage' => url()->current(),
                ]);
                break;

            case $c === 'Accommodation/Show':
                $st = $get('stay');
                $cover = data_get($st, 'image') ?: data_get($st, 'gallery.0');
                $where = data_get($st, 'location') ?: data_get($st, 'destination.name');
                $seo['title'] = data_get($st, 'name');
                $seo['description'] = data_get($st, 'excerpt') ?: trim(data_get($st, 'type').($where ? " in $where" : '').' — a place to stay on KLM Safaris trips in Tanzania.');
                $seo['image'] = $cover;
                $seo['schema'][] = array_filter(['@type' => 'LodgingBusiness', 'name' => data_get($st, 'name'), 'image' => self::abs($cover), 'address' => $where ? ['@type' => 'PostalAddress', 'addressLocality' => $where, 'addressCountry' => 'TZ'] : null, 'url' => data_get($st, 'website')]);
                break;

            case $c === 'Page':
                $pg = $get('page');
                $seo['title'] = data_get($pg, 'meta_title') ?: data_get($pg, 'title');
                $seo['description'] = data_get($pg, 'meta_description') ?: data_get($pg, 'subtitle') ?: data_get($pg, 'body');
                $seo['image'] = data_get($pg, 'image');
                break;
        }

        return self::finish($seo, $s, $site, $page);
    }

    private static function finish(array $seo, array $s, string $site, array $page): array
    {
        $title = self::text($seo['title'] ?: $site, 70);
        // "Tour name | KLM Safaris", unless the title already names the company.
        $full = Str::contains(Str::lower($title), Str::lower($site)) ? $title : "$title | $site";
        $description = self::text($seo['description'] ?: $s['meta_description'], 160);
        $image = self::abs($seo['image'] ?: $s['og_image'] ?: $s['logo']);

        // Canonical: the address without filters/tracking, keeping only real pagination.
        $canonical = url()->current();
        if (($n = (int) request()->query('page')) > 1) {
            $canonical .= '?page='.$n;
        }

        $socials = array_values(array_filter(array_map(fn ($k) => $s[$k] ?? null, ['facebook', 'instagram', 'x', 'linkedin', 'pinterest', 'youtube', 'tiktok', 'tripadvisor', 'yopal'])));
        $org = array_filter([
            '@type' => 'TravelAgency',
            '@id' => url('/').'#organization',
            'name' => $site,
            'legalName' => $s['company_name'] ?? null,
            'url' => url('/'),
            'logo' => self::abs($s['logo']),
            'image' => self::abs($s['og_home_image'] ?: $s['logo']),
            'email' => $s['email'] ?? null,
            'telephone' => $s['phone'] ?? null,
            'address' => ['@type' => 'PostalAddress', 'streetAddress' => 'Market Street', 'addressLocality' => 'Moshi', 'addressRegion' => 'Kilimanjaro', 'addressCountry' => 'TZ'],
            'sameAs' => $socials ?: null,
        ]);

        $twitter = preg_match('#(?:x|twitter)\.com/([A-Za-z0-9_]+)#', (string) ($s['x'] ?? ''), $m) ? '@'.$m[1] : null;

        return [
            'title' => $full,
            'description' => $description,
            'image' => $image,
            'url' => $canonical,
            'type' => $seo['type'],
            'robots' => $seo['robots'],
            'published' => $seo['published'] ?? null,
            'site' => $site,
            'twitter' => $twitter,
            'schema' => $seo['robots'] === 'index,follow'
                ? ['@context' => 'https://schema.org', '@graph' => array_values([$org, ...$seo['schema']])]
                : null,
        ];
    }

    /** Plain text for a meta tag: no HTML, no *highlight* stars, single spaces, cut at a word. */
    public static function text(?string $value, int $max): string
    {
        $plain = trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags(str_replace('*', '', (string) $value)), ENT_QUOTES | ENT_HTML5)));

        return Str::limit($plain, $max, '…');
    }

    /** Absolute URL for an image path. */
    public static function abs(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return preg_match('#^https?://#', $path) ? $path : url($path);
    }
}
