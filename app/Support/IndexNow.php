<?php

namespace App\Support;

use App\Models\Accommodation;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Page;
use App\Models\Post;
use App\Models\Tour;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Tells search engines the moment a tour, blog post, page, destination, experience or place to stay is published,
 * changed or removed, so they re-crawl it straight away instead of waiting to find it in the sitemap.
 * IndexNow is shared by Bing, Yandex, Seznam, Naver and others; Google reads /sitemap.xml (listed in robots.txt).
 * Only runs on the live site (APP_ENV=production), after the CMS has already answered, so saving is never slower.
 */
class IndexNow
{
    /** Model => its public address. */
    public const PATHS = [
        Tour::class => '/tours/',
        Post::class => '/journal/',
        Destination::class => '/destinations/',
        Accommodation::class => '/accommodation/',
        Category::class => '/experiences/',
        Page::class => '/',
    ];

    /** The site's IndexNow key, served at /indexnow-key.txt. Set INDEXNOW_KEY to choose one; otherwise it comes from APP_KEY. */
    public static function key(): string
    {
        return config('services.indexnow.key') ?: substr(hash('sha256', 'indexnow'.config('app.key')), 0, 32);
    }

    public static function watch(): void
    {
        foreach (array_keys(self::PATHS) as $class) {
            $class::saved(fn (Model $m) => self::changed($m));
            $class::deleted(fn (Model $m) => self::changed($m, true));
        }
    }

    private static function changed(Model $m, bool $deleted = false): void
    {
        if (! app()->isProduction() || app()->runningInConsole() || ! $m->slug) {
            return;
        }
        $published = array_key_exists('is_published', $m->getAttributes());
        // Drafts that were never live are nobody's business; anything live, or just taken offline, is.
        if (! $deleted && $published && ! $m->is_published && ! $m->getOriginal('is_published')) {
            return;
        }
        $urls = [url(self::PATHS[$m::class].$m->slug), url('/sitemap.xml')];
        if ($m->wasChanged('slug') && $m->getOriginal('slug')) {
            $urls[] = url(self::PATHS[$m::class].$m->getOriginal('slug'));
        }
        dispatch(fn () => self::submit($urls))->afterResponse();
    }

    public static function submit(array $urls): void
    {
        try {
            Http::timeout(8)->asJson()->post('https://api.indexnow.org/indexnow', [
                'host' => parse_url(url('/'), PHP_URL_HOST),
                'key' => self::key(),
                'keyLocation' => url('/indexnow-key.txt'),
                'urlList' => array_values(array_unique($urls)),
            ]);
        } catch (\Throwable $e) {
            Log::info('IndexNow not reached: '.$e->getMessage());
        }
    }
}
