<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Page;
use App\Models\Post;
use App\Models\Tour;

/** /sitemap.xml — every public page, built from the CMS so new tours, posts and pages appear automatically. */
class SitemapController extends Controller
{
    public function __invoke()
    {
        $urls = [];
        $add = function (string $path, $updated = null, string $priority = '0.6') use (&$urls) {
            $urls[] = ['loc' => url($path), 'lastmod' => $updated ? $updated->toAtomString() : null, 'priority' => $priority];
        };

        $add('/', null, '1.0');
        foreach (['/tours', '/destinations', '/accommodation', '/journal', '/gallery', '/plan-your-trip', '/contact'] as $path) {
            $add($path, null, '0.8');
        }
        Category::orderBy('sort_order')->get()->each(fn ($c) => $add("/experiences/{$c->slug}", $c->updated_at, '0.8'));
        Tour::published()->whereNull('redirect_to')->get(['slug', 'updated_at'])->each(fn ($t) => $add("/tours/{$t->slug}", $t->updated_at, '0.9'));
        Destination::orderBy('sort_order')->get(['slug', 'updated_at'])->each(fn ($d) => $add("/destinations/{$d->slug}", $d->updated_at, '0.7'));
        Accommodation::published()->get(['slug', 'updated_at'])->each(fn ($a) => $add("/accommodation/{$a->slug}", $a->updated_at, '0.5'));
        Post::published()->get(['slug', 'updated_at'])->each(fn ($p) => $add("/journal/{$p->slug}", $p->updated_at, '0.6'));
        Page::where('is_published', true)->whereNull('redirect_to')->get(['slug', 'updated_at'])->each(fn ($p) => $add("/{$p->slug}", $p->updated_at, '0.5'));

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as $u) {
            $xml .= '  <url><loc>'.e($u['loc']).'</loc>'.($u['lastmod'] ? '<lastmod>'.$u['lastmod'].'</lastmod>' : '').'<priority>'.$u['priority'].'</priority></url>'."\n";
        }

        return response($xml."</urlset>\n", 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
