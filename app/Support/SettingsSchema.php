<?php

namespace App\Support;

/**
 * Every editable site-wide setting, grouped for the admin "Site settings" screen.
 * Defaults are KLM Safaris' existing website content, so a fresh install matches klmsafaris.com.
 */
class SettingsSchema
{
    public static function groups(): array
    {
        $k = fn (string $file) => "/images/klm/$file";
        $fontOptions = fn (array $fonts) => array_combine(array_keys($fonts), array_keys($fonts));
        $links = ['label' => 'text', 'url' => 'text'];

        return [
            'design' => [
                'label' => 'Design (fonts & colours)',
                'fields' => [
                    'font_heading' => ['label' => 'Heading font', 'type' => 'select', 'options' => $fontOptions(Theme::HEADING_FONTS), 'default' => 'Archivo'],
                    'font_body' => ['label' => 'Body font', 'type' => 'select', 'options' => $fontOptions(Theme::BODY_FONTS), 'default' => 'Archivo'],
                    'color_primary' => ['label' => 'Brand colour (buttons, highlights)', 'type' => 'color', 'default' => '#4A8DC1'],
                    'color_dark' => ['label' => 'Dark colour (header, footer, dark sections)', 'type' => 'color', 'default' => '#0E1113'],
                    'color_accent' => ['label' => 'Accent colour (stars, badges)', 'type' => 'color', 'default' => '#F9DF74'],
                    'color_light' => ['label' => 'Light background colour', 'type' => 'color', 'default' => '#F5F3EE'],
                    'color_text' => ['label' => 'Text colour', 'type' => 'color', 'default' => '#111417'],
                    'favicon' => ['label' => 'Browser tab icon', 'type' => 'image', 'default' => $k('2016-04-Logo-1.png')],
                ],
            ],
            'brand' => [
                'label' => 'Brand & contact',
                'fields' => [
                    'site_name' => ['label' => 'Site name', 'type' => 'text', 'default' => 'KLM Safaris'],
                    'tagline' => ['label' => 'Tagline', 'type' => 'text', 'default' => 'Journey with KLM Safaris'],
                    'logo' => ['label' => 'Logo', 'type' => 'image', 'default' => $k('2016-04-Logo-1.png'), 'help' => 'Shown in the header and footer. Leave empty to use the text wordmark.'],
                    'logo_light' => ['label' => 'Logo for dark backgrounds (optional)', 'type' => 'image', 'default' => ''],
                    'company_name' => ['label' => 'Registered company name', 'type' => 'text', 'default' => 'KLM Safaris Company Ltd'],
                    'email' => ['label' => 'Email', 'type' => 'text', 'default' => 'info@klmsafaris.com'],
                    'phone' => ['label' => 'Phone', 'type' => 'text', 'default' => '+255 755 547 595'],
                    'phone_2' => ['label' => 'Second phone', 'type' => 'text', 'default' => '+61 410 194 966'],
                    'whatsapp' => ['label' => 'WhatsApp number (digits only, with country code)', 'type' => 'text', 'default' => '61410194966'],
                    'address' => ['label' => 'Office address', 'type' => 'textarea', 'default' => "Market Street, P.O Box 7815\nMoshi, Kilimanjaro\nTanzania – East Africa"],
                    'office_hours' => ['label' => 'Office hours', 'type' => 'text', 'default' => 'Mon – Sat · 08:00 – 18:00 EAT'],
                    'map_embed' => ['label' => 'Google Maps embed URL (contact page)', 'type' => 'text', 'default' => 'https://www.google.com/maps?q=Market+Street,+Moshi,+Tanzania&output=embed'],
                    'enquiry_email' => ['label' => 'Send new enquiry alerts to', 'type' => 'text', 'default' => 'info@klmsafaris.com'],
                    'announcement_text' => ['label' => 'Announcement bar text (leave empty to hide)', 'type' => 'text', 'default' => 'KLM Safaris Internship Opportunity – Online Tourism Marketing and Content Creation'],
                    'announcement_link' => ['label' => 'Announcement bar link', 'type' => 'text', 'default' => '/internship-opportunity'],
                ],
            ],
            'social' => [
                'label' => 'Social & reviews',
                'fields' => [
                    'facebook' => ['label' => 'Facebook URL', 'type' => 'text', 'default' => 'https://www.facebook.com/klmsafaris/'],
                    'instagram' => ['label' => 'Instagram URL', 'type' => 'text', 'default' => 'https://www.instagram.com/klmsafaris/'],
                    'x' => ['label' => 'X (Twitter) URL', 'type' => 'text', 'default' => 'https://x.com/klmsafaris'],
                    'linkedin' => ['label' => 'LinkedIn URL', 'type' => 'text', 'default' => 'https://www.linkedin.com/company/klm-safaris/'],
                    'pinterest' => ['label' => 'Pinterest URL', 'type' => 'text', 'default' => 'https://www.pinterest.com/klmsafaris/'],
                    'youtube' => ['label' => 'YouTube URL', 'type' => 'text', 'default' => ''],
                    'tripadvisor' => ['label' => 'Tripadvisor URL', 'type' => 'text', 'default' => 'https://www.tripadvisor.com/Attraction_Review-g317084-d16663354-Reviews-KLM_Safaris-Moshi_Kilimanjaro_Region.html'],
                    'rating_score' => ['label' => 'Review score (e.g. 5.0 — leave empty to show stars only)', 'type' => 'text', 'default' => ''],
                    'rating_count' => ['label' => 'Review count label', 'type' => 'text', 'default' => '145 Tripadvisor reviews'],
                    'rating_source' => ['label' => 'Review source', 'type' => 'text', 'default' => 'Tripadvisor'],
                ],
            ],
            'home' => [
                'label' => 'Homepage',
                'fields' => [
                    'hero_facts' => ['label' => 'Hero trust bar (bottom of the video)', 'type' => 'repeater', 'fields' => ['title' => 'text', 'text' => 'text'], 'default' => [
                        ['title' => 'Locally owned', 'text' => 'Market Street, Moshi'],
                        ['title' => '145 Tripadvisor reviews', 'text' => 'Real guest experiences'],
                        ['title' => 'Kilimanjaro · Safari · Zanzibar', 'text' => 'Climbs, safaris & day trips'],
                        ['title' => 'TTB & TANAPA partners', 'text' => 'Flying Doctors’ Society member'],
                    ]],
                    'home_intro_eyebrow' => ['label' => 'Intro eyebrow', 'type' => 'text', 'default' => 'Tanzania is our home'],
                    'home_intro_title' => ['label' => 'Intro title', 'type' => 'text', 'default' => 'Journey with *KLM Safaris*'],
                    'home_intro_text' => ['label' => 'Intro text', 'type' => 'textarea', 'default' => 'Tanzania is our home and we understand the nature and beauty of its balance which brings life. Our expert travel guides understand every single detail about the adventure and promise to give you the best experience you will never forget. From the heights of Mount Kilimanjaro to the plains of Serengeti to the beautiful white sands of the Indian Ocean in Zanzibar, we can provide the experience you long for.'],
                    'home_help_title' => ['label' => 'Help banner title', 'type' => 'text', 'default' => 'Not sure where to begin?'],
                    'home_help_text' => ['label' => 'Help banner text', 'type' => 'text', 'default' => 'Planning and preparation are crucial to the success of Safari in Tanzania — talk to our Moshi team for free, honest advice.'],
                    'fullmoon_title' => ['label' => 'Full moon band title', 'type' => 'text', 'default' => 'Kilimanjaro *Full Moon* Dates Schedule'],
                    'fullmoon_text' => ['label' => 'Full moon band text', 'type' => 'textarea', 'default' => 'Summit Uhuru Peak under the light of the full moon. Join one of our scheduled group climbs or plan a private full-moon ascent.'],
                    'fullmoon_link' => ['label' => 'Full moon band link', 'type' => 'text', 'default' => '/kilimanjaro-full-moon-dates-schedule'],
                    'fullmoon_image' => ['label' => 'Full moon band image', 'type' => 'image', 'default' => $k('2016-04-how-much-is-kilimanjaro-park-fee.jpg')],
                    'home_advice_eyebrow' => ['label' => 'Why-us eyebrow', 'type' => 'text', 'default' => 'Why travel with KLM Safaris'],
                    'home_advice_title' => ['label' => 'Why-us title', 'type' => 'text', 'default' => 'Planning and preparation are *crucial* to the success of Safari in Tanzania'],
                    'home_advice_text' => ['label' => 'Why-us text', 'type' => 'textarea', 'default' => 'Our expert travel guides understand every single detail about the adventure — from the heights of Mount Kilimanjaro to the plains of Serengeti and the white sands of Zanzibar.'],
                    'home_advice_image' => ['label' => 'Why-us main image', 'type' => 'image', 'default' => $k('2024-11-ABD09542-scaled.jpg')],
                    'home_advice_image_2' => ['label' => 'Why-us secondary image', 'type' => 'image', 'default' => $k('2024-11-ngorongorocrater-1.jpg')],
                    'home_advice_badge_value' => ['label' => 'Why-us badge number', 'type' => 'text', 'default' => '145+'],
                    'home_advice_badge_label' => ['label' => 'Why-us badge label', 'type' => 'text', 'default' => 'Tripadvisor reviews'],
                    'home_advice_points' => ['label' => 'Why-us points', 'type' => 'repeater', 'fields' => ['title' => 'text', 'text' => 'textarea'], 'default' => [
                        ['title' => 'Tanzania is our home', 'text' => 'A locally owned company based on Market Street in Moshi, at the foot of Kilimanjaro.'],
                        ['title' => 'Expert local guides', 'text' => 'Our guides understand every single detail about the adventure and promise the best experience you will never forget.'],
                        ['title' => 'Sustainable travel', 'text' => 'We operate in ways that reduce environmental impacts, benefit host communities and protect destinations for future generations.'],
                        ['title' => 'Safe travel partner', 'text' => 'Members of the Flying Doctors’ Society of Africa with Global Rescue travel protection available for every safari.'],
                    ]],
                    'home_kili_eyebrow' => ['label' => 'Kilimanjaro eyebrow', 'type' => 'text', 'default' => 'Discover the best routes to the Roof of Africa'],
                    'home_kili_title' => ['label' => 'Kilimanjaro title', 'type' => 'text', 'default' => 'Popular Mount *Kilimanjaro* Trekking'],
                    'home_kili_text' => ['label' => 'Kilimanjaro text', 'type' => 'textarea', 'default' => 'Lemosho, Machame, Rongai, Umbwe, Marangu and the Northern Circuit — every route guided by our experienced Moshi mountain crew.'],
                    'home_kili_image' => ['label' => 'Kilimanjaro background image', 'type' => 'image', 'default' => $k('2016-04-Kilimanjaro-hiking-10.jpg')],
                    'home_dest_title' => ['label' => 'Destinations title', 'type' => 'text', 'default' => 'Popular *destinations*'],
                    'home_stats_title' => ['label' => 'Impact title (shown when Impact stats exist)', 'type' => 'text', 'default' => 'What we have *achieved* so far'],
                    'home_stats_image' => ['label' => 'Impact background image', 'type' => 'image', 'default' => $k('2016-11-Serengeti-National-Park4-1.jpg')],
                    'home_reviews_title' => ['label' => 'Reviews title', 'type' => 'text', 'default' => 'Trusted travel *experiences*'],
                    'home_journal_title' => ['label' => 'Blog title', 'type' => 'text', 'default' => 'From our *blog*'],
                    'home_partners_title' => ['label' => 'Partners title', 'type' => 'text', 'default' => 'Our partners & memberships'],
                    'rescue_eyebrow' => ['label' => 'Travel protection eyebrow', 'type' => 'text', 'default' => 'Global Rescue Travel'],
                    'rescue_title' => ['label' => 'Travel protection title', 'type' => 'text', 'default' => 'Wander the world *without worry*'],
                    'rescue_text' => ['label' => 'Travel protection text', 'type' => 'textarea', 'default' => 'Accident or injury. Unplanned incidents are rare but can crop up when you travel. That’s why KLM Safari Co. Ltd wants you to have the most robust travel protection for your safari. If you need travel insurance, click the link below.'],
                    'rescue_image' => ['label' => 'Travel protection image', 'type' => 'image', 'default' => $k('2016-04-Global-Rescue-Image.jpg')],
                    'rescue_button' => ['label' => 'Travel protection button', 'type' => 'text', 'default' => 'Get travel protection'],
                    'rescue_link' => ['label' => 'Travel protection link', 'type' => 'text', 'default' => 'https://www.globalrescue.com/'],
                    'home_cta_title' => ['label' => 'Closing banner title', 'type' => 'text', 'default' => 'Your Tanzania journey *starts here*'],
                    'home_cta_text' => ['label' => 'Closing banner text', 'type' => 'textarea', 'default' => 'Tell us how you dream of travelling and our team in Moshi will reply with ideas, honest advice and a tailor-made itinerary.'],
                    'home_cta_image' => ['label' => 'Closing banner image', 'type' => 'image', 'default' => $k('2016-11-Tarangire-national-park-10-scaled.jpg')],
                ],
            ],
            'headers' => [
                'label' => 'Page headers',
                'fields' => [
                    'tours_hero_image' => ['label' => 'Tours page – image', 'type' => 'image', 'default' => $k('2016-11-Serengeti-National-Park4-1.jpg')],
                    'tours_hero_eyebrow' => ['label' => 'Tours page – eyebrow', 'type' => 'text', 'default' => 'Tours & safaris'],
                    'tours_hero_title' => ['label' => 'Tours page – title', 'type' => 'text', 'default' => 'Find your *perfect* journey'],
                    'tours_hero_text' => ['label' => 'Tours page – text', 'type' => 'textarea', 'default' => 'Kilimanjaro climbs, Tanzania safaris, day tours and Zanzibar holidays — filter by what moves you.'],
                    'destinations_hero_image' => ['label' => 'Destinations page – image', 'type' => 'image', 'default' => $k('2019-01-Ngorongoro-Crater00.jpg')],
                    'destinations_hero_eyebrow' => ['label' => 'Destinations page – eyebrow', 'type' => 'text', 'default' => 'Where we travel'],
                    'destinations_hero_title' => ['label' => 'Destinations page – title', 'type' => 'text', 'default' => 'Tanzania, *from mountain to coast*'],
                    'destinations_hero_text' => ['label' => 'Destinations page – text', 'type' => 'textarea', 'default' => 'From the heights of Mount Kilimanjaro to the plains of Serengeti and the beautiful white sands of Zanzibar.'],
                    'journal_hero_image' => ['label' => 'Blog page – image', 'type' => 'image', 'default' => $k('2025-01-klm-safaris_env-scaled.jpg')],
                    'journal_hero_eyebrow' => ['label' => 'Blog page – eyebrow', 'type' => 'text', 'default' => 'Get inspired by our blog'],
                    'journal_hero_title' => ['label' => 'Blog page – title', 'type' => 'text', 'default' => 'Stories & *travel advice*'],
                    'journal_hero_text' => ['label' => 'Blog page – text', 'type' => 'textarea', 'default' => 'Travel tips, Kilimanjaro advice, safari seasons and sustainability news from KLM Safaris.'],
                    'contact_hero_image' => ['label' => 'Contact page – image', 'type' => 'image', 'default' => $k('2016-11-Bunner01-2.jpg')],
                    'contact_hero_eyebrow' => ['label' => 'Contact page – eyebrow', 'type' => 'text', 'default' => 'Contact info'],
                    'contact_hero_title' => ['label' => 'Contact page – title', 'type' => 'text', 'default' => 'Let’s plan your *Tanzania* trip'],
                    'contact_hero_text' => ['label' => 'Contact page – text', 'type' => 'textarea', 'default' => 'Questions, ideas or a booking — our Moshi team replies personally.'],
                    'plan_title' => ['label' => 'Trip planner – side title', 'type' => 'text', 'default' => 'Five quick questions. One journey designed only for you.'],
                    'plan_image' => ['label' => 'Trip planner – default image', 'type' => 'image', 'default' => $k('2022-12-luxury.jpg')],
                    'plan_budgets' => ['label' => 'Trip planner – budget options', 'type' => 'repeater', 'fields' => ['title' => 'text', 'range' => 'text', 'text' => 'textarea'], 'default' => [
                        ['title' => 'Budget', 'range' => 'Under $1,500 pp', 'text' => 'Camping safaris and simple, comfortable lodges.'],
                        ['title' => 'Comfort', 'range' => '$1,500 – $3,000 pp', 'text' => 'Characterful mid-range lodges and tented camps.'],
                        ['title' => 'Premium', 'range' => '$3,000 – $5,000 pp', 'text' => 'Hand-picked lodges in prime locations.'],
                        ['title' => 'Luxury', 'range' => '$5,000+ pp', 'text' => 'Luxury lodges, fly-in safaris and private guiding.'],
                    ]],
                ],
            ],
            'footer' => [
                'label' => 'Footer & newsletter',
                'fields' => [
                    'newsletter_title' => ['label' => 'Newsletter title', 'type' => 'text', 'default' => 'Tanzania, delivered to your inbox'],
                    'newsletter_text' => ['label' => 'Newsletter text', 'type' => 'textarea', 'default' => 'Kilimanjaro full-moon dates, safari seasons, offers and travel advice from KLM Safaris.'],
                    'footer_about' => ['label' => 'Footer about text', 'type' => 'textarea', 'default' => 'Tanzania is our home and we understand the nature and beauty of its balance which brings life. Kilimanjaro climbs, safaris, day tours, Zanzibar holidays and volunteering from Moshi.'],
                    'footer_col1_title' => ['label' => 'Footer column 1 title', 'type' => 'text', 'default' => 'Popular destinations'],
                    'footer_col1_links' => ['label' => 'Footer column 1 links', 'type' => 'repeater', 'fields' => $links, 'default' => [
                        ['label' => 'Kilimanjaro Routes', 'url' => '/experiences/kilimanjaro'],
                        ['label' => 'Tanzania Safaris', 'url' => '/experiences/safari'],
                        ['label' => 'Zanzibar Beach Holidays', 'url' => '/experiences/zanzibar'],
                        ['label' => 'Day Tours', 'url' => '/experiences/day-tours'],
                        ['label' => 'Mount Meru Trekking', 'url' => '/mount-meru-trekking'],
                        ['label' => 'Sustainability', 'url' => '/sustainable-travel-3'],
                    ]],
                    'footer_col2_title' => ['label' => 'Footer column 2 title', 'type' => 'text', 'default' => 'Useful links'],
                    'footer_col2_links' => ['label' => 'Footer column 2 links', 'type' => 'repeater', 'fields' => $links, 'default' => [
                        ['label' => 'Information about Tanzania', 'url' => '/information-about-tanzania'],
                        ['label' => 'Travel Advice', 'url' => '/travel-advice'],
                        ['label' => 'Travel Information', 'url' => '/travel-information'],
                        ['label' => 'Tanzania Tourist Board', 'url' => 'https://www.tanzaniatourism.go.tz/'],
                        ['label' => 'Tanzania National Parks (TANAPA)', 'url' => 'https://www.tanzaniaparks.go.tz/'],
                        ['label' => 'Booking Terms and Conditions', 'url' => '/booking-terms-and-conditions'],
                    ]],
                    'payments_image' => ['label' => 'Payment methods image', 'type' => 'image', 'default' => $k('2016-04-payment-gateways.png')],
                    'copyright' => ['label' => 'Copyright line', 'type' => 'text', 'default' => 'KLM Safaris Company Ltd. All rights reserved.'],
                ],
            ],
            'seo' => [
                'label' => 'SEO',
                'fields' => [
                    'meta_description' => ['label' => 'Default meta description', 'type' => 'textarea', 'default' => 'KLM Safaris — Kilimanjaro climbs, Tanzania safaris, day tours, Zanzibar holidays and volunteering with a locally owned tour operator in Moshi, Tanzania.'],
                    'og_image' => ['label' => 'Default share image', 'type' => 'image', 'default' => $k('2022-12-luxury.jpg')],
                ],
            ],
        ];
    }

    public static function fields(): array
    {
        $all = [];
        foreach (static::groups() as $group) {
            $all += $group['fields'];
        }

        return $all;
    }
}
