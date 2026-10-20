<?php

namespace App\Support;

use App\Models;

/**
 * Declarative definitions for every CMS-managed content type.
 * The generic admin controller and React form renderer are driven entirely by this map,
 * so adding a field here is all it takes to make it editable.
 */
class AdminResources
{
    private static function f(string $name, string $label, string $type = 'text', array $opts = []): array
    {
        return ['name' => $name, 'label' => $label, 'type' => $type] + $opts;
    }

    public static function all(): array
    {
        $f = fn (...$a) => static::f(...$a);
        $half = ['width' => 'half'];
        $req = ['required' => true];

        return [
            'tours' => [
                'model' => Models\Tour::class,
                'label' => 'Tours & Packages',
                'singular' => 'Tour',
                'icon' => 'compass',
                'group' => 'Content',
                'title' => 'title',
                'image' => 'image',
                'order' => ['sort_order', 'asc'],
                'search' => ['title', 'subtitle'],
                'filter' => ['field' => 'category_id', 'label' => 'Category', 'model' => Models\Category::class],
                'columns' => [
                    ['name' => 'category.name', 'label' => 'Category'],
                    ['name' => 'duration_days', 'label' => 'Days'],
                    ['name' => 'price_from', 'label' => 'From', 'format' => 'money'],
                    ['name' => 'is_featured', 'label' => 'Featured', 'format' => 'bool'],
                    ['name' => 'is_published', 'label' => 'Live', 'format' => 'bool'],
                ],
                'with' => ['category'],
                'view' => '/tours/{slug}',
                'tabs' => [
                    'Basics' => [
                        $f('title', 'Title', 'text', $req + $half),
                        $f('slug', 'URL slug', 'text', $half + ['help' => 'Auto-generated from the title if empty.']),
                        $f('category_id', 'Category', 'relation', $half + ['model' => Models\Category::class, 'display' => 'name']),
                        $f('group_name', 'Menu group', 'text', $half + ['help' => 'Groups tours inside the menu, e.g. “Machame Route” or “Migration Safari”.']),
                        $f('destinations', 'Destinations', 'multirelation', $half + ['model' => Models\Destination::class, 'display' => 'name']),
                        $f('subtitle', 'Subtitle', 'text'),
                        $f('excerpt', 'Card summary', 'textarea'),
                        $f('badge', 'Badge (e.g. Bestseller)', 'text', $half),
                        $f('sort_order', 'Sort order', 'number', $half),
                        $f('is_featured', 'Feature on homepage', 'toggle', $half),
                        $f('is_published', 'Published', 'toggle', $half + ['default' => true]),
                    ],
                    'Details' => [
                        $f('duration_days', 'Duration (days)', 'number', $half + $req),
                        $f('price_from', 'Price from (USD)', 'number', $half),
                        $f('price_note', 'Price note', 'text', $half + ['help' => 'e.g. per person sharing']),
                        $f('season', 'Season', 'text', $half + ['help' => 'e.g. All year round']),
                        $f('difficulty', 'Difficulty / Style', 'text', $half),
                        $f('group_size', 'Group size', 'text', $half),
                        $f('min_age', 'Minimum age', 'text', $half),
                        $f('departure', 'Departure', 'text', $half),
                        $f('departure_time', 'Departure time', 'text', $half),
                        $f('return_time', 'Return time', 'text', $half),
                        $f('dress_code', 'Dress code', 'textarea'),
                        $f('overview', 'Overview', 'richtext'),
                        $f('highlights', 'Highlights', 'list'),
                    ],
                    'Itinerary' => [
                        $f('itinerary', 'Day by day', 'repeater', ['fields' => ['title' => 'text', 'description' => 'textarea', 'accommodation' => 'text', 'meals' => 'text', 'altitude' => 'text'], 'itemLabel' => 'Day']),
                    ],
                    'Inclusions' => [
                        $f('includes', 'What’s included', 'list', $half),
                        $f('excludes', 'Not included', 'list', $half),
                    ],
                    'Pricing' => [
                        $f('pricing', 'Price per person by group size', 'repeater', ['fields' => ['people' => 'text', 'price' => 'text'], 'itemLabel' => 'Row', 'help' => 'Shown as a pricing table on the tour page. “people” = number of travellers, “price” = USD per person.']),
                    ],
                    'Media' => [
                        $f('image', 'Cover image', 'image', $req),
                        $f('gallery', 'Gallery', 'gallery'),
                        $f('route_map', 'Route map image', 'image'),
                    ],
                    'SEO' => [
                        $f('meta_title', 'Meta title', 'text'),
                        $f('meta_description', 'Meta description', 'textarea'),
                    ],
                ],
            ],
            'categories' => [
                'model' => Models\Category::class,
                'label' => 'Categories',
                'singular' => 'Category',
                'icon' => 'layers',
                'group' => 'Content',
                'title' => 'name',
                'image' => 'image',
                'order' => ['sort_order', 'asc'],
                'columns' => [
                    ['name' => 'tagline', 'label' => 'Tagline'],
                    ['name' => 'show_in_menu', 'label' => 'In menu', 'format' => 'bool'],
                ],
                'view' => '/experiences/{slug}',
                'tabs' => ['Basics' => [
                    $f('name', 'Name', 'text', $req + $half),
                    $f('slug', 'URL slug', 'text', $half),
                    $f('tagline', 'Tagline', 'text'),
                    $f('description', 'Description', 'textarea'),
                    $f('image', 'Image', 'image'),
                    $f('home_title', 'Homepage section title', 'text', $half + ['help' => 'e.g. “Most Popular Safaris”. Wrap a word in *asterisks* for a highlight.']),
                    $f('home_text', 'Homepage section text', 'text', $half),
                    $f('show_in_menu', 'Show in main menu', 'toggle', $half + ['default' => true]),
                    $f('show_on_home', 'Show a row of its tours on the homepage', 'toggle', $half + ['default' => true]),
                    $f('sort_order', 'Sort order', 'number', $half),
                ]],
            ],
            'destinations' => [
                'model' => Models\Destination::class,
                'label' => 'Destinations',
                'singular' => 'Destination',
                'icon' => 'map',
                'group' => 'Content',
                'title' => 'name',
                'image' => 'image',
                'order' => ['sort_order', 'asc'],
                'search' => ['name', 'region'],
                'columns' => [
                    ['name' => 'region', 'label' => 'Region'],
                    ['name' => 'best_time', 'label' => 'Best time'],
                    ['name' => 'is_featured', 'label' => 'Featured', 'format' => 'bool'],
                ],
                'view' => '/destinations/{slug}',
                'tabs' => [
                    'Basics' => [
                        $f('name', 'Name', 'text', $req + $half),
                        $f('slug', 'URL slug', 'text', $half),
                        $f('region', 'Region', 'text', $half),
                        $f('best_time', 'Best time to visit', 'text', $half),
                        $f('tagline', 'Tagline', 'text'),
                        $f('excerpt', 'Summary', 'textarea'),
                        $f('body', 'Full description', 'richtext'),
                        $f('highlights', 'Highlights', 'list'),
                        $f('is_featured', 'Feature on homepage', 'toggle', $half + ['default' => true]),
                        $f('sort_order', 'Sort order', 'number', $half),
                    ],
                    'Media' => [
                        $f('image', 'Cover image', 'image', $req),
                        $f('gallery', 'Gallery', 'gallery'),
                    ],
                ],
            ],
            'posts' => [
                'model' => Models\Post::class,
                'label' => 'Blog',
                'singular' => 'Article',
                'icon' => 'pen',
                'group' => 'Content',
                'title' => 'title',
                'image' => 'image',
                'order' => ['published_at', 'desc'],
                'search' => ['title', 'topic'],
                'columns' => [
                    ['name' => 'topic', 'label' => 'Topic'],
                    ['name' => 'published_at', 'label' => 'Published', 'format' => 'date'],
                    ['name' => 'is_published', 'label' => 'Live', 'format' => 'bool'],
                ],
                'view' => '/journal/{slug}',
                'tabs' => ['Article' => [
                    $f('title', 'Title', 'text', $req),
                    $f('slug', 'URL slug', 'text', $half),
                    $f('topic', 'Topic', 'text', $half),
                    $f('author', 'Author', 'text', $half),
                    $f('read_minutes', 'Reading time (min)', 'number', $half),
                    $f('published_at', 'Publish date', 'date', $half),
                    $f('is_published', 'Published', 'toggle', $half + ['default' => true]),
                    $f('excerpt', 'Excerpt', 'textarea'),
                    $f('image', 'Cover image', 'image', $req),
                    $f('body', 'Body', 'richtext'),
                ]],
            ],
            'pages' => [
                'model' => Models\Page::class,
                'label' => 'Pages',
                'singular' => 'Page',
                'icon' => 'file',
                'group' => 'Content',
                'title' => 'title',
                'image' => 'image',
                'order' => ['sort_order', 'asc'],
                'columns' => [
                    ['name' => 'slug', 'label' => 'URL', 'format' => 'path'],
                    ['name' => 'footer_group', 'label' => 'Footer group'],
                    ['name' => 'is_published', 'label' => 'Live', 'format' => 'bool'],
                ],
                'view' => '/{slug}',
                'tabs' => [
                    'Page' => [
                        $f('title', 'Title', 'text', $req + $half),
                        $f('slug', 'URL slug', 'text', $half),
                        $f('eyebrow', 'Eyebrow', 'text', $half),
                        $f('footer_group', 'Footer column', 'select', $half + ['options' => ['' => '— none —', 'About' => 'About Us', 'Volunteer' => 'Volunteering', 'Sustainability' => 'Sustainability', 'Kilimanjaro' => 'Kilimanjaro', 'Safari' => 'Safari', 'Day Tours' => 'Day Tours', 'Zanzibar' => 'Zanzibar', 'Travel Info' => 'Travel info', 'Legal' => 'Legal'], 'help' => 'Which menu/footer section links to this page.']),
                        $f('menu_title', 'Menu label (leave empty to hide from menus)', 'text', $half),
                        $f('subtitle', 'Subtitle', 'textarea'),
                        $f('image', 'Hero image', 'image'),
                        $f('body', 'Content', 'richtext'),
                        $f('is_published', 'Published', 'toggle', $half + ['default' => true]),
                        $f('sort_order', 'Sort order', 'number', $half),
                    ],
                    'Feature blocks' => [
                        $f('sections', 'Image + text blocks shown under the content', 'repeater', ['fields' => ['title' => 'text', 'text' => 'textarea', 'image' => 'image'], 'itemLabel' => 'Block']),
                    ],
                    'SEO' => [
                        $f('meta_title', 'Meta title', 'text'),
                        $f('meta_description', 'Meta description', 'textarea'),
                    ],
                ],
            ],
            'hero-slides' => [
                'model' => Models\HeroSlide::class,
                'label' => 'Hero Slides',
                'singular' => 'Slide',
                'icon' => 'image',
                'group' => 'Homepage',
                'title' => 'title',
                'image' => 'image',
                'order' => ['sort_order', 'asc'],
                'columns' => [
                    ['name' => 'eyebrow', 'label' => 'Eyebrow'],
                    ['name' => 'is_active', 'label' => 'Active', 'format' => 'bool'],
                ],
                'tabs' => ['Slide' => [
                    $f('eyebrow', 'Eyebrow', 'text', $half),
                    $f('sort_order', 'Sort order', 'number', $half),
                    $f('title', 'Headline', 'text', $req + ['help' => 'Wrap a word in *asterisks* to set it in italic gold.']),
                    $f('subtitle', 'Sub-headline', 'textarea'),
                    $f('image', 'Background image (also the video poster)', 'image', $req),
                    $f('video', 'Background video (optional, MP4)', 'video', ['help' => 'Upload an MP4 in the media library or paste a link. Plays muted on loop behind the slide; the image shows until it loads.']),
                    $f('cta_label', 'Button label', 'text', $half),
                    $f('cta_url', 'Button link', 'text', $half),
                    $f('is_active', 'Active', 'toggle', ['default' => true]),
                ]],
            ],
            'stats' => [
                'model' => Models\Stat::class,
                'label' => 'Impact Stats',
                'singular' => 'Stat',
                'icon' => 'chart',
                'group' => 'Homepage',
                'title' => 'label',
                'order' => ['sort_order', 'asc'],
                'columns' => [['name' => 'value', 'label' => 'Value'], ['name' => 'suffix', 'label' => 'Suffix']],
                'tabs' => ['Stat' => [
                    $f('value', 'Number', 'text', $req + $half),
                    $f('suffix', 'Suffix (e.g. +, %)', 'text', $half),
                    $f('label', 'Label', 'text', $req),
                    $f('caption', 'Caption', 'textarea'),
                    $f('sort_order', 'Sort order', 'number', $half),
                ]],
            ],
            'testimonials' => [
                'model' => Models\Testimonial::class,
                'label' => 'Testimonials',
                'singular' => 'Testimonial',
                'icon' => 'quote',
                'group' => 'Homepage',
                'title' => 'name',
                'image' => 'avatar',
                'order' => ['sort_order', 'asc'],
                'columns' => [['name' => 'country', 'label' => 'Country'], ['name' => 'rating', 'label' => 'Rating'], ['name' => 'is_active', 'label' => 'Live', 'format' => 'bool']],
                'tabs' => ['Review' => [
                    $f('name', 'Guest name', 'text', $req + $half),
                    $f('country', 'Country', 'text', $half),
                    $f('rating', 'Rating (1-5)', 'number', $half + ['default' => 5]),
                    $f('source', 'Source', 'text', $half + ['help' => 'Tripadvisor, Google…']),
                    $f('title', 'Headline', 'text'),
                    $f('quote', 'Review', 'textarea', $req),
                    $f('trip', 'Trip taken', 'text', $half),
                    $f('avatar', 'Photo', 'image', $half),
                    $f('is_active', 'Show on site', 'toggle', $half + ['default' => true]),
                    $f('sort_order', 'Sort order', 'number', $half),
                ]],
            ],
            'partners' => [
                'model' => Models\Partner::class,
                'label' => 'Partners & Badges',
                'singular' => 'Partner',
                'icon' => 'award',
                'group' => 'Homepage',
                'title' => 'name',
                'image' => 'logo',
                'order' => ['sort_order', 'asc'],
                'columns' => [['name' => 'url', 'label' => 'Link']],
                'tabs' => ['Partner' => [
                    $f('name', 'Name', 'text', $req + $half),
                    $f('subtitle', 'Full name / description', 'text', $half),
                    $f('logo', 'Logo', 'image', ['help' => 'Optional — the name is shown as a wordmark when empty.']),
                    $f('url', 'Link', 'text', $half),
                    $f('sort_order', 'Sort order', 'number', $half),
                ]],
            ],
            'team' => [
                'model' => Models\TeamMember::class,
                'label' => 'Team',
                'singular' => 'Team member',
                'icon' => 'users',
                'group' => 'Company',
                'title' => 'name',
                'image' => 'photo',
                'order' => ['sort_order', 'asc'],
                'columns' => [['name' => 'role', 'label' => 'Role'], ['name' => 'is_consultant', 'label' => 'Consultant', 'format' => 'bool']],
                'tabs' => ['Member' => [
                    $f('name', 'Name', 'text', $req + $half),
                    $f('role', 'Role', 'text', $half),
                    $f('email', 'Email', 'text', $half),
                    $f('sort_order', 'Sort order', 'number', $half),
                    $f('photo', 'Photo', 'image'),
                    $f('bio', 'Bio', 'textarea'),
                    $f('is_consultant', 'Show as travel consultant in CTAs', 'toggle'),
                ]],
            ],
            'faqs' => [
                'model' => Models\Faq::class,
                'label' => 'FAQs',
                'singular' => 'FAQ',
                'icon' => 'help',
                'group' => 'Company',
                'title' => 'question',
                'order' => ['sort_order', 'asc'],
                'columns' => [['name' => 'topic', 'label' => 'Topic']],
                'tabs' => ['FAQ' => [
                    $f('topic', 'Topic', 'text', $half),
                    $f('sort_order', 'Sort order', 'number', $half),
                    $f('question', 'Question', 'text', $req),
                    $f('answer', 'Answer', 'textarea', $req),
                ]],
            ],
        ];
    }

    public static function get(string $key): array
    {
        $all = static::all();
        abort_unless(isset($all[$key]), 404);

        return $all[$key] + ['key' => $key];
    }

    public static function fields(array $resource): array
    {
        return array_merge(...array_values($resource['tabs']));
    }

    /** Lightweight navigation metadata for the admin sidebar. */
    public static function nav(): array
    {
        return collect(static::all())->map(fn ($r, $key) => [
            'key' => $key,
            'label' => $r['label'],
            'icon' => $r['icon'],
            'group' => $r['group'],
        ])->values()->all();
    }
}
