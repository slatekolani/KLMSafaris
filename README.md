# KLM Safaris

Laravel 10 (PHP) + Inertia + React + TypeScript + Tailwind CSS + MySQL, with a built-in CMS at `/admin`.

## Run

1. Start MySQL (XAMPP).
2. `composer install && npm install` (first time only)
3. `composer run dev`

This migrates and seeds the `klmsafaris` database (seeding only runs on an empty database, so CMS
edits are never overwritten), then starts the PHP server (http://127.0.0.1:8000) and Vite together.

Admin login: `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` → http://127.0.0.1:8000/admin

## Content

All content is managed in the CMS: tours (itinerary, inclusions, group pricing, gallery, menu group),
categories (menu + homepage rows), destinations, pages (menu/footer placement), blog, hero slides,
reviews, partners, FAQs, team, and Site settings (fonts, brand colours, logo, contact details,
homepage text, page headers, footer links, SEO).

The launch content was imported from the old klmsafaris.com:

- `database/scripts/scrape-klmsafaris.php` – re-runnable importer → `database/seeders/data/*.json`
  and images in `public/images/klm/`
- `database/seeders/ContentSeeder.php` – loads that data into the CMS tables

To start over from the imported content: `php artisan migrate:fresh --seed` (erases CMS edits).

## Layout

- `resources/js/Pages/*.tsx` – public pages; `resources/js/Pages/Admin/*` – CMS
- `app/Support/AdminResources.php` – every CMS content type and its fields
- `app/Support/SettingsSchema.php` – every site setting and its default
- `app/Support/Theme.php` – fonts and colours from the Design settings
# enaboishu
