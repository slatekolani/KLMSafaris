<?php

/**
 * One-off importer: pulls the live klmsafaris.com content (tours, destinations, pages, blog)
 * into database/seeders/data/*.json and downloads every referenced image into public/images/klm.
 *
 *   php database/scripts/scrape-klmsafaris.php
 *
 * The seeders then load those JSON files, so the CMS starts with the exact same content.
 */

const BASE = 'https://klmsafaris.com';
$root = dirname(__DIR__, 2);
$dataDir = "$root/database/seeders/data";
$imgDir = "$root/public/images/klm";
$cacheDir = sys_get_temp_dir().'/klm-scrape-cache';
@mkdir($dataDir, 0777, true);
@mkdir($imgDir, 0777, true);
@mkdir($cacheDir, 0777, true);
libxml_use_internal_errors(true);

function fetch(string $url): string
{
    global $cacheDir;
    $file = $cacheDir.'/'.md5($url).'.html';
    if (is_file($file)) {
        return file_get_contents($file);
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 40, CURLOPT_USERAGENT => 'Mozilla/5.0 (KLM redesign importer)']);
    $html = (string) curl_exec($ch);
    curl_close($ch);
    file_put_contents($file, $html);
    usleep(150000);

    return $html;
}

function dom(string $html): array
{
    $d = new DOMDocument();
    $d->loadHTML(mb_encode_numericentity($html, [0x80, 0x10FFFF, 0, 0x1FFFFF], 'UTF-8'));

    return [$d, new DOMXPath($d)];
}

function cls(string $c): string
{
    return "contains(concat(' ', normalize-space(@class), ' '), ' $c ')";
}

function txt(?DOMNode $n): string
{
    return $n ? trim(preg_replace('/\s+/u', ' ', html_entity_decode($n->textContent, ENT_QUOTES | ENT_HTML5, 'UTF-8'))) : '';
}

/** Download an image once and return its public path. */
function localImage(?string $url): ?string
{
    global $imgDir;
    if (! $url || ! str_contains($url, '/wp-content/uploads/')) {
        return null;
    }
    $url = strtok($url, '?');
    // Prefer the full-size original over WordPress thumbnails.
    $full = preg_replace('/-\d+x\d+(\.\w+)$/', '$1', $url);
    $rel = str_replace('/', '-', substr($full, strpos($full, '/uploads/') + 9));
    $dest = "$imgDir/$rel";
    if (! is_file($dest)) {
        foreach (array_unique([$full, $url]) as $try) {
            $ch = curl_init($try);
            curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 60]);
            $bin = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $type = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            curl_close($ch);
            if ($code === 200 && str_starts_with($type, 'image/') && strlen($bin) > 500) {
                file_put_contents($dest, $bin);
                break;
            }
        }
    }

    return is_file($dest) ? "/images/klm/$rel" : null;
}

function imgSrc(DOMElement $img): string
{
    foreach (['data-lzl-src', 'data-src', 'data-lazy-src', 'src'] as $a) {
        $v = $img->getAttribute($a);
        if ($v && ! str_starts_with($v, 'data:')) {
            return $v;
        }
    }

    return '';
}

/** Clean CMS-ready HTML from a content node: keep semantic tags only. */
function cleanHtml(DOMNode $node): string
{
    $allowed = ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'blockquote', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br'];
    $out = '';
    foreach ($node->childNodes as $child) {
        if ($child instanceof DOMText) {
            $t = preg_replace('/\s+/u', ' ', $child->textContent);
            $out .= htmlspecialchars($t, ENT_QUOTES | ENT_HTML5, 'UTF-8', false);
            continue;
        }
        if (! $child instanceof DOMElement) {
            continue;
        }
        $tag = strtolower($child->nodeName);
        if (in_array($tag, ['script', 'style', 'noscript', 'form', 'iframe', 'svg', 'button', 'nav'])) {
            continue;
        }
        if ($tag === 'h1' || $tag === 'h5' || $tag === 'h6') {
            $tag = 'h3';
        }
        if ($tag === 'img') {
            $src = localImage(imgSrc($child));
            if ($src) {
                $out .= '<img src="'.$src.'" alt="'.htmlspecialchars($child->getAttribute('alt')).'">';
            }
            continue;
        }
        $inner = cleanHtml($child);
        if (! in_array($tag, $allowed)) {
            $out .= $inner;
            continue;
        }
        if (trim(strip_tags($inner, '<img>')) === '' && ! in_array($tag, ['br'])) {
            continue;
        }
        if ($tag === 'a') {
            $href = $child->getAttribute('href');
            $href = preg_replace('#^https?://(www\.)?klmsafaris\.com#', '', $href);
            $href = preg_replace('#^/tour-item/#', '/tours/', $href);
            $out .= '<a href="'.htmlspecialchars($href).'">'.$inner.'</a>';
            continue;
        }
        $out .= $tag === 'br' ? '<br>' : "<$tag>".trim($inner)."</$tag>";
    }

    return $out;
}

function prettify(string $html): string
{
    $html = preg_replace('#(</(p|h2|h3|h4|ul|ol|li|table|tr|blockquote)>)#', "$1\n", $html);
    $html = preg_replace('/\n{2,}/', "\n", $html);

    return trim($html);
}

/* ------------------------------------------------------------------ Tours */
$skip = '/(testing|gappa|dummy|imporvements|new-tour-itme|tanzania-wildlife-to-see|cycling-testing)/';
// The old homepage's "Tanzania Luxury Safari" card lives at this malformed URL.
$renamed = ['https-klmsafaris-com-tour-item-7-day-serengeti-migration-lodge-safari-august-september' => 'tanzania-luxury-safari'];
$sitemap = fetch(BASE.'/tour-item-sitemap.xml');
preg_match_all('#<loc>(https://klmsafaris\.com/tour-item/[^<]+)</loc>#', $sitemap, $m);
$urls = array_values(array_filter(array_unique(array_map(fn ($u) => rtrim($u, '/'), $m[1])), fn ($u) => ! preg_match($skip, $u)));
// Tours linked from the old homepage/menu but missing from the sitemap.
foreach (['family-safari', 'private-safari', 'camping-safari', 'https-klmsafaris-com-tour-item-7-day-serengeti-migration-lodge-safari-august-september'] as $extra) {
    $urls[] = BASE."/tour-item/$extra";
}
$urls = array_values(array_unique($urls));

$tours = [];
foreach ($urls as $url) {
    [$d, $x] = dom(fetch($url.'/'));
    $title = txt($x->query("//h3[".cls('mkdf-tour-item-title')."]")->item(0));
    if (! $title) {
        fwrite(STDERR, "skip (no title): $url\n");
        continue;
    }
    $slug = $renamed[basename($url)] ?? basename($url);
    $html = fetch($url.'/');
    // Some tours crash on the old site (a price stored as "3,867 "); keep them as drafts with what is recoverable.
    $draft = str_contains($html, 'Fatal error');
    $brokenPrice = preg_match("/round\\('([\\d,.]+)/", $html, $bp) ? (float) str_replace(',', '', $bp[1]) : null;
    $priceText = txt($x->query("//span[".cls('mkdf-tours-item-price')."]")->item(0));
    $content = $x->query("//div[".cls('mkdf-tour-item-content')."]")->item(0);
    $days = txt($x->query("//div[".cls('mkdf-tour-duration-holder')."]")->item(0));
    $age = txt($x->query("//div[".cls('mkdf-tour-min-age-holder')."]")->item(0));
    $types = [];
    foreach ($x->query("//span[".cls('mkdf-tour-cat-item-text')."]") as $n) {
        $types[] = txt($n);
    }

    $info = [];
    $included = $excluded = [];
    foreach ($x->query("//ul[".cls('mkdf-tour-main-info-holder')."]/li") as $li) {
        $label = txt($x->query(".//div[".cls('mkdf-info')."]", $li)->item(0));
        $valueNode = $x->query(".//div[".cls('mkdf-value')."]", $li)->item(0);
        $attrs = [];
        foreach ($x->query(".//div[".cls('mkdf-tour-main-info-attr')."]", $li) as $a) {
            $attrs[] = txt($a);
        }
        if (stripos($label, 'not included') === 0) {
            $excluded = $attrs;
        } elseif (stripos($label, 'included') === 0) {
            $included = $attrs;
        } else {
            $info[$label] = txt($valueNode);
        }
    }
    $included = array_values(array_filter($included, fn ($i) => $i !== $title));

    $plan = [];
    foreach ($x->query("//div[".cls('mkd-tour-item-plan-part')."]") as $part) {
        $pt = txt($x->query(".//h5", $part)->item(0));
        $descNode = $x->query(".//div[".cls('mkd-tour-item-plan-part-description')."]", $part)->item(0);
        $desc = $descNode ? trim(preg_replace("/[ \t]+/", ' ', html_entity_decode(strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>'], "\n", $d->saveHTML($descNode))), ENT_QUOTES | ENT_HTML5, 'UTF-8'))) : '';
        $desc = preg_replace("/\n\s*\n+/", "\n", $desc);
        $altitude = '';
        if (preg_match_all('/\(?\s*([\d.,]{4,6})\s*(?:meters|m)\b/i', $pt.' '.$desc, $mm)) {
            $altitude = str_replace('.', ',', end($mm[1])).' m';
        }
        $plan[] = ['title' => preg_replace('/^Day\s*\d+\s*[:\-–]\s*/i', '', $pt), 'description' => trim($desc), 'accommodation' => '', 'meals' => '', 'altitude' => $altitude];
    }

    $gallery = [];
    foreach ($x->query("//*[@id='tour-item-gallery-id']//a[@href]") as $a) {
        if ($p = localImage($a->getAttribute('href'))) {
            $gallery[] = $p;
        }
    }
    $cover = null;
    foreach ($x->query("//img") as $img) {
        $src = imgSrc($img);
        if (str_contains($src, '/uploads/') && ! preg_match('/(Logo|payment|gateway|logo)/', $src) && ! str_contains($src, 'Gallery')) {
            $cover = localImage($src);
            if ($cover) {
                break;
            }
        }
    }
    $og = $x->query("//meta[@property='og:image']")->item(0);
    $cover ??= $gallery[0] ?? localImage($og?->getAttribute('content'));

    $pricing = [];
    foreach ($x->query("//*[starts-with(@id,'tour-item-custom')]//tr") as $tr) {
        $cells = [];
        foreach ($x->query('./td', $tr) as $td) {
            $cells[] = txt($td);
        }
        if (count($cells) >= 2) {
            $pricing[] = ['people' => $cells[0], 'price' => $cells[1]];
        }
    }

    $meta = $x->query("//meta[@name='description']")->item(0);
    $tours[] = [
        'slug' => $slug,
        'title' => $title,
        'price' => $priceText ? (float) preg_replace('/[^\d.]/', '', $priceText) : $brokenPrice,
        'draft' => $draft,
        'price_note' => txt($x->query("//span[".cls('mkdf-tour-item-price-text')."]")->item(0)) ?: null,
        'overview' => $content ? prettify(cleanHtml($content)) : '',
        'days' => preg_match('/hour/i', $days) ? 1 : (preg_match('/\d+/', $days, $dm) ? (int) $dm[0] : 1),
        'min_age' => trim(str_ireplace('Age', '', $age)) ?: null,
        'types' => $types,
        'destination' => $info['Destination'] ?? null,
        'departure' => $info['Departure'] ?? ($info['Departure Location'] ?? null),
        'departure_time' => $info['Departure Time'] ?? null,
        'return_time' => $info['Return Time'] ?? null,
        'dress_code' => $info['Dress Code'] ?? null,
        'includes' => $included,
        'excludes' => $excluded,
        'itinerary' => $plan,
        'gallery' => array_values(array_unique($gallery)),
        'image' => $cover,
        'pricing' => $pricing,
        'meta_description' => $meta?->getAttribute('content'),
    ];
    fwrite(STDERR, "tour: $title (".count($plan)." days, ".count($gallery)." imgs)\n");
}
file_put_contents("$dataDir/tours.json", json_encode($tours, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

/* ------------------------------------------------------------------ Generic content pages */
function scrapePage(string $url): ?array
{
    [$d, $x] = dom(fetch($url));
    // Pick the largest content container — the first Elementor block on the page is the mega menu.
    $node = null;
    $best = 0;
    foreach ($x->query("//*[@data-elementor-type='wp-page' or @data-elementor-type='wp-post' or @data-elementor-type='single-post' or @data-elementor-type='single-page'] | //div[".cls('entry-content')." or ".cls('mkdf-post-text')." or ".cls('wpb-content-wrapper')."] | //article") as $cand) {
        if ($cand->getAttribute('data-elementor-id') === '14284') {
            continue; // site-wide mega menu template
        }
        if ($x->query("ancestor::header | ancestor::*[@data-elementor-type='header'] | ancestor::nav", $cand)->length) {
            continue;
        }
        $len = strlen(trim($cand->textContent));
        if ($len > $best) {
            $best = $len;
            $node = $cand;
        }
    }
    $ogTitle = $x->query("//meta[@property='og:title']")->item(0)?->getAttribute('content');
    $h1 = $node ? txt($x->query('.//h1', $node)->item(0)) : '';
    $title = $h1 ?: preg_replace('/\s*[-|–]\s*KLM Safaris.*$/i', '', (string) ($ogTitle ?: txt($x->query('//title')->item(0))));
    if (! $node) {
        return null;
    }
    foreach ($x->query(".//header|.//footer|.//nav|.//form|.//*[".cls('elementor-widget-nav-menu')."]|.//*[".cls('mkdf-blog-single-navigation')."]|.//*[".cls('comments-area')."]|.//*[".cls('mkdf-post-info')."]", $node) as $rm) {
        $rm->parentNode?->removeChild($rm);
    }
    $og = $x->query("//meta[@property='og:image']")->item(0);
    $date = $x->query("//meta[@property='article:published_time']")->item(0);
    $desc = $x->query("//meta[@name='description']")->item(0);
    $html = prettify(cleanHtml($node));
    // Drop a leading heading that just repeats the title.
    $html = preg_replace('#^<h[23]>'.preg_quote(htmlspecialchars($title, ENT_QUOTES | ENT_HTML5), '#').'</h[23]>\s*#u', '', $html);
    $firstImg = preg_match('#<img src="([^"]+)"#', $html, $im) ? $im[1] : null;

    return [
        'title' => $title,
        'body' => $html,
        'image' => localImage($og?->getAttribute('content')) ?? $firstImg,
        'date' => $date?->getAttribute('content'),
        'excerpt' => $desc?->getAttribute('content') ?: mb_substr(trim(strip_tags($html)), 0, 220),
    ];
}

$pages = [];
foreach ([
    'about-klm-safaris' => ['About', 'About KLM Safaris'],
    'why-traveling-with-klm-safaris' => ['About', 'Why travel with us'],
    'meet-our-team' => ['About', null],
    'travel-information' => ['Travel Info', 'Travel Information'],
    'travel-advice' => ['Travel Info', null],
    'information-about-tanzania' => ['Travel Info', null],
    'kilimanjaro-climbing-preparation' => ['Kilimanjaro', 'All Climbing Preparations'],
    'safety-and-climbing' => ['Kilimanjaro', 'Safety and Climbing'],
    'klm-climbing-faq' => ['Kilimanjaro', null],
    'kilimanjaro-full-moon-dates-schedule' => ['Kilimanjaro', null],
    'kilimanjaro-routes' => ['Kilimanjaro', null],
    'mount-meru-trekking' => ['Kilimanjaro', null],
    'tanzania-safari' => ['Safari', null],
    'day-tours' => ['Day Tours', null],
    'zanzibar-beach-holiday' => ['Zanzibar', null],
    'accommodation-in-tanzania' => ['Travel Info', null],
    'childrens-home-support' => ['Volunteer', 'Children’s Home Support'],
    'health-volunteering' => ['Volunteer', 'Health Volunteering'],
    'education-volunteering-2' => ['Volunteer', 'Education Volunteering'],
    'environment-conservation' => ['Volunteer', 'Environment Conservation'],
    'sports-and-games-volunteering' => ['Volunteer', 'Sports and Games Volunteering'],
    'apply-to-volunteer' => ['Volunteer', null],
    'sustainable-travel-3' => ['Sustainability', 'Sustainable Travel and Tourism'],
    'our-climate-emergency-plan' => ['Sustainability', 'KLM Climate Emergency Plan'],
    'sustainable-travel-2' => ['Sustainability', null],
    'myths-about-sustainable-tourism' => ['Sustainability', null],
    'internship-opportunity' => ['About', null],
    'booking-terms-and-conditions' => ['Legal', 'Booking Terms and Conditions'],
    'terms-and-conditions' => ['Legal', null],
] as $slug => [$group, $menuTitle]) {
    $p = scrapePage(BASE."/$slug/");
    if (! $p || strlen(strip_tags($p['body'])) < 80) {
        fwrite(STDERR, "page skipped (empty): $slug\n");
        continue;
    }
    $pages[] = ['slug' => $slug, 'group' => $group, 'menu_title' => $menuTitle] + $p;
    fwrite(STDERR, "page: $slug\n");
}
file_put_contents("$dataDir/pages.json", json_encode($pages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

/* ------------------------------------------------------------------ Blog */
preg_match_all('#<loc>(https://klmsafaris\.com/[^<]+)</loc>#', fetch(BASE.'/post-sitemap.xml'), $pm);
$posts = [];
foreach ($pm[1] as $url) {
    if (str_ends_with(rtrim($url, '/'), '/blog')) {
        continue;
    }
    $p = scrapePage($url);
    if (! $p || strlen(strip_tags($p['body'])) < 200) {
        continue;
    }
    $posts[] = ['slug' => basename(rtrim($url, '/'))] + $p;
    fwrite(STDERR, "post: {$p['title']}\n");
}
file_put_contents("$dataDir/posts.json", json_encode($posts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

/* ------------------------------------------------------------------ Destinations */
$destinations = [];
foreach (['kilimanjaro', 'serengeti-safari-adventures', 'ngorongoro', 'tarangire', 'lake-manyara', 'arusha', 'zanzibar', 'lake-victoria'] as $slug) {
    $p = scrapePage(BASE."/destinations/$slug/");
    if (! $p) {
        continue;
    }
    $destinations[] = ['slug' => $slug] + $p;
    fwrite(STDERR, "destination: $slug\n");
}
file_put_contents("$dataDir/destinations.json", json_encode($destinations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

/* ------------------------------------------------------------------ Brand assets */
$assets = [];
foreach ([
    'logo' => '2016/04/Logo-1.png',
    'logo_alt' => '2016/04/Logo.png',
    'global_rescue' => '2016/04/Global-Rescue-Image.jpg',
    'ttb' => '2016/10/logo_ttb.png',
    'tanapa' => '2016/10/tanapa.png',
    'fdsa' => '2016/10/fdsa-logo.png',
    'jata' => '2016/10/jata-logo.png',
    'wyse' => '2016/10/wysetc-logo.png',
    'storyteller' => '2016/04/Traveller-Storyteller.png',
    'global_rescue_logo' => '2016/04/global-travel-partner-logo.png',
    'stta' => '2016/04/org_f7ba5f77-ac22-ed11-b83d-000d3a2d2ed8.jpg',
    'payments' => '2016/04/payment-gateways.png',
    'luxury' => '2016/04/KLM-Luxury-Safaris-600x870.jpg',
    'camping' => '2022/12/Camping-Safaris-600x870.jpg',
    'tarangire_tall' => '2019/01/Tarangire-National-Pack2-600x870.jpg',
    'ngorongoro_tall' => '2019/01/Ngorongoro-Crater4-600x870.jpg',
] as $key => $path) {
    $assets[$key] = localImage(BASE."/wp-content/uploads/$path");
}
file_put_contents("$dataDir/assets.json", json_encode($assets, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

fwrite(STDERR, "\nDone: ".count($tours).' tours, '.count($pages).' pages, '.count($posts).' posts, '.count($destinations)." destinations\n");

/* ------------------------------------------------------------------ Tripadvisor reviews (Trustindex widget on the homepage) */
[$d, $x] = dom(fetch(BASE.'/'));
$reviews = [];
foreach ($x->query("//div[".cls('ti-review-item')."]") as $item) {
    $name = txt($x->query(".//*[".cls('ti-name')."]", $item)->item(0));
    $content = $x->query(".//*[".cls('ti-review-content')."]", $item)->item(0);
    $titleNode = $content ? $x->query('./strong', $content)->item(0) : null;
    $title = txt($titleNode);
    if ($titleNode) {
        $titleNode->parentNode->removeChild($titleNode);
    }
    $text = txt($content);
    if (! $name || ! $text) {
        continue;
    }
    $full = $x->query(".//*[".cls('ti-stars')."]//img[not(ancestor::noscript)][contains(@data-lzl-src,'/f.svg') or contains(@src,'/f.svg')]", $item)->length;
    $half = $x->query(".//*[".cls('ti-stars')."]//img[not(ancestor::noscript)][contains(@data-lzl-src,'/h.svg') or contains(@src,'/h.svg')]", $item)->length;
    $stars = (int) round($full + $half / 2) ?: 5;
    $reviews[] = ['name' => $name, 'title' => $title ?: null, 'quote' => preg_replace('/\s*(Read more|Hide)\s*$/i', '', $text), 'rating' => min(5, $stars), 'date' => (int) $item->getAttribute('data-time')];
}
$ratingText = txt($x->query("//*[".cls('ti-footer')."]")->item(0));
file_put_contents("$dataDir/reviews.json", json_encode(['summary' => $ratingText, 'reviews' => $reviews], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
fwrite(STDERR, count($reviews)." reviews\n");
