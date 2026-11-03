<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tour;
use Illuminate\Database\Seeder;

/**
 * Puts the Kilimanjaro category back together after it was deleted and re-created in the CMS
 * (the new one became "kilimanjaro-2" and the 14 climbing tours lost their category).
 * Safe to run more than once: php artisan db:seed --class=KilimanjaroRepairSeeder --force
 */
class KilimanjaroRepairSeeder extends Seeder
{
    /** Tour slug => menu group, as on the original site. */
    private const TOURS = [
        'kilimanjaro-6-days-lemosho-route' => 'Lemosho Route',
        'kilimanjaro-7-days-lemosho-route' => 'Lemosho Route',
        'kilimanjaro-8-days-lemosho-route' => 'Lemosho Route',
        'kilimanjaro-6-days-machame-route' => 'Machame Route',
        'kilimanjaro-7-days-machame-route' => 'Machame Route',
        'kilimanjaro-5-days-marangu-route' => 'Marangu Route',
        'kilimanjaro-6-days-marangu-route' => 'Marangu Route',
        'kilimanjaro-6-days-rongai-route' => 'Rongai Route',
        'kilimanjaro-7-days-rongai-route' => 'Rongai Route',
        'kilimanjaro-6-days-umbwe-route' => 'Umbwe Route',
        'kilimanjaro-9-days-northern-circuit-route' => 'Northern Circuit',
        'mount-meru-climbing-3-days' => 'Mount Meru',
        'mount-meru-climbing-4-days' => 'Mount Meru',
        'oldoinyo-lengai-mountain-trek' => 'Oldoinyo Lengai',
    ];

    private const DEFAULTS = [
        'name' => 'Kilimanjaro',
        'tagline' => 'Discover the best routes to the Roof of Africa',
        'description' => 'Lemosho, Machame, Rongai, Umbwe, Marangu and the Northern Circuit, plus Mount Meru and Oldoinyo Lengai.',
        'home_title' => 'Popular Mount *Kilimanjaro* Trekking',
        'image' => '/images/klm/2016-04-Kilimanjaro-hiking-10.jpg',
        'show_in_menu' => true,
        'show_on_home' => true,
        'sort_order' => 0,
    ];

    public function run(): void
    {
        // 1. One Kilimanjaro category with the address /experiences/kilimanjaro.
        $category = Category::where('slug', 'kilimanjaro')->first()
            ?? Category::where('slug', 'like', 'kilimanjaro-%')->orWhere('name', 'Kilimanjaro')->orderBy('id')->first();
        if ($category) {
            $category->slug = 'kilimanjaro';
            foreach (self::DEFAULTS as $field => $value) {
                if (blank($category->{$field}) || in_array($field, ['show_in_menu', 'show_on_home'], true)) {
                    $category->{$field} = $value;
                }
            }
            $category->save();
        } else {
            $category = Category::create(['slug' => 'kilimanjaro'] + self::DEFAULTS);
        }
        $this->command?->info("Kilimanjaro category: #{$category->id} /experiences/kilimanjaro");

        // 2. Its default included / not included lists (only fills empty ones).
        (new ContentSeeder)->categoryIncludes();
        $category->refresh();

        // 3. Link the climbing tours back to it.
        $missing = [];
        foreach (self::TOURS as $slug => $group) {
            $tour = Tour::where('slug', $slug)->first();
            if (! $tour) {
                $missing[] = $slug;
                continue;
            }
            $tour->category_id = $category->id;
            $tour->group_name = $tour->group_name ?: $group;
            $tour->save(); // empty includes/excludes are filled from the category (Tour model)
        }
        $linked = count(self::TOURS) - count($missing);
        $this->command?->info("Tours linked to Kilimanjaro: {$linked}");
        if ($missing) {
            $this->command?->warn('Not found on this site (import the content database to add them): '.implode(', ', $missing));
        }
    }
}
