<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Page;
use App\Models\Post;
use App\Models\Tour;

/** /sitemap.xml: every public page, built from the CMS so new tours, posts and pages appear automatically. */
class SitemapController extends Controller
{
    public function __invoke()
    {
        $urls = [];
        // Each address with its last change and its main photo (Google Images also reads <image:image>).
        $add = function (string $path, $updated = null, string $priority = '0.6', ?string $image = null) use (&$urls) {
            $urls[] = ['loc' => url($path), 'lastmod' => $updated?->toAtomString(), 'priority' => $priority, 'image' => $image ? url($image) : null];
        };

        $tours = Tour::published()->whereNull('redirect_to')->get(['slug', 'image', 'updated_at']);
        $posts = Post::published()->get(['slug', 'image', 'updated_at']);
        $stays = Accommodation::published()->get(['slug', 'image', 'updated_at']);
        $newest = fn ($items) => $items->max('updated_at');

        $add('/', $newest($tours->concat($posts)), '1.0');
        $add('/tours', $newest($tours), '0.8');
        $add('/journal', $newest($posts), '0.8');
        $add('/accommodation', $newest($stays), '0.8');
        foreach (['/destinations', '/gallery', '/plan-your-trip', '/contact'] as $path) {
            $add($path, null, '0.8');
        }
        Category::orderBy('sort_order')->get()->each(fn ($c) => $add("/experiences/{$c->slug}", $c->updated_at, '0.8', $c->image));
        $tours->each(fn ($t) => $add("/tours/{$t->slug}", $t->updated_at, '0.9', $t->image));
        Destination::orderBy('sort_order')->get(['slug', 'image', 'updated_at'])->each(fn ($d) => $add("/destinations/{$d->slug}", $d->updated_at, '0.7', $d->image));
        $stays->each(fn ($a) => $add("/accommodation/{$a->slug}", $a->updated_at, '0.5', $a->image));
        $posts->each(fn ($p) => $add("/journal/{$p->slug}", $p->updated_at, '0.7', $p->image));
        Page::where('is_published', true)->whereNull('redirect_to')->get(['slug', 'image', 'updated_at'])->each(fn ($p) => $add("/{$p->slug}", $p->updated_at, '0.5', $p->image));

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'."\n";
        foreach ($urls as $u) {
            $xml .= '  <url><loc>'.e($u['loc']).'</loc>'
                .($u['lastmod'] ? '<lastmod>'.$u['lastmod'].'</lastmod>' : '')
                .'<priority>'.$u['priority'].'</priority>'
                .($u['image'] && ! str_starts_with($u['image'], 'data:') ? '<image:image><image:loc>'.e($u['image']).'</image:loc></image:image>' : '')
                .'</url>'."\n";
        }

        // Never cached on the way, so a tour or post saved a minute ago is already listed.
        return response($xml."</urlset>\n", 200, ['Content-Type' => 'application/xml; charset=UTF-8', 'Cache-Control' => 'no-cache, must-revalidate']);
    }
}
