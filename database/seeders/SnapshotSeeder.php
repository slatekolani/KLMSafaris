<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Brings a site's content in line with the snapshot in database/seeders/data/snapshot (the finished content of
 * November 2026: pages, tours, categories, accommodation, settings, FAQs…). Rows are matched by slug or key, so it
 * updates an existing site without duplicates and never touches users, enquiries or subscribers.
 * Run on its own: php artisan db:seed --class=SnapshotSeeder --force (ContentSeeder also runs it at the end).
 */
class SnapshotSeeder extends Seeder
{
    public function run(): void
    {
        $dir = database_path('seeders/data/snapshot');
        if (! is_dir($dir)) {
            return;
        }
        $read = fn (string $name) => json_decode(file_get_contents("$dir/$name.json"), true) ?? [];
        $now = now();

        DB::transaction(function () use ($read, $now) {
            // Categories first, so tours can point at them.
            $categories = $read('categories');
            foreach ($categories as $row) {
                DB::table('categories')->updateOrInsert(['slug' => $row['slug']], $row + ['updated_at' => $now]);
            }
            $this->upsert('destinations', 'slug', $read('destinations'));
            $catId = DB::table('categories')->pluck('id', 'slug');
            $destId = DB::table('destinations')->pluck('id', 'slug');

            foreach ($read('tours') as $row) {
                $row['category_id'] = $catId[$row['category_slug']] ?? null;
                unset($row['category_slug']);
                DB::table('tours')->updateOrInsert(['slug' => $row['slug']], $row);
            }
            $tourId = DB::table('tours')->pluck('id', 'slug');

            // Which destinations each tour visits: rebuilt for the snapshot's tours only.
            $pairs = collect($read('destination_tour'))->filter(fn ($p) => isset($destId[$p['destination']], $tourId[$p['tour']]));
            DB::table('destination_tour')->whereIn('tour_id', $pairs->map(fn ($p) => $tourId[$p['tour']])->unique()->values())->delete();
            DB::table('destination_tour')->insertOrIgnore($pairs->map(fn ($p) => ['destination_id' => $destId[$p['destination']], 'tour_id' => $tourId[$p['tour']]])->values()->all());

            foreach ($read('accommodations') as $row) {
                $row['destination_id'] = $destId[$row['destination_slug']] ?? null;
                unset($row['destination_slug']);
                DB::table('accommodations')->updateOrInsert(['slug' => $row['slug']], $row);
            }

            $this->upsert('pages', 'slug', $read('pages'));
            $this->upsert('posts', 'slug', $read('posts'));
            $this->upsert('settings', 'key', $read('settings'));
            $this->upsert('gallery_photos', 'image', $read('gallery_photos'));

            // Curated lists without a natural key: replaced as a whole (only when the snapshot has some).
            foreach (['faqs', 'hero_slides', 'partners', 'testimonials', 'stats', 'team_members'] as $table) {
                $rows = $read($table);
                if ($rows) {
                    DB::table($table)->delete();
                    DB::table($table)->insert($rows);
                }
            }

            // Empty leftovers, e.g. a category re-created as "kilimanjaro-2" after the original was deleted.
            DB::table('categories')->whereNotIn('slug', array_column($categories, 'slug'))
                ->whereNotExists(fn ($q) => $q->from('tours')->whereColumn('tours.category_id', 'categories.id'))->delete();
        });

        Cache::forget('settings');
        $this->command?->info('Content synced from the snapshot.');
    }

    private function upsert(string $table, string $key, array $rows): void
    {
        foreach ($rows as $row) {
            DB::table($table)->updateOrInsert([$key => $row[$key]], $row);
        }
    }
}
