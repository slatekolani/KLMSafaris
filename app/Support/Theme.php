<?php

namespace App\Support;

use App\Models\Setting;

/** Turns the Design settings (fonts + brand colours) into a Google Fonts URL and CSS variables. */
class Theme
{
    public const HEADING_FONTS = [
        'Nunito Sans' => ['Nunito+Sans:ital,opsz,wght@0,6..12,300..800;1,6..12,400', 'sans-serif'],
        'Afacad' => ['Afacad:ital,wght@0,400..700;1,400..700', 'sans-serif'],
        'Archivo' => ['Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900', 'sans-serif'],
        'Inter Tight' => ['Inter+Tight:ital,wght@0,300..800;1,400', 'sans-serif'],
        'Fraunces' => ['Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700', 'serif'],
        'Playfair Display' => ['Playfair+Display:ital,wght@0,400..700;1,400..700', 'serif'],
        'DM Serif Display' => ['DM+Serif+Display:ital@0;1', 'serif'],
        'Merriweather' => ['Merriweather:ital,wght@0,300;0,400;0,700;1,400', 'serif'],
        'Lora' => ['Lora:ital,wght@0,400..700;1,400..700', 'serif'],
        'Cormorant Garamond' => ['Cormorant+Garamond:ital,wght@0,400..700;1,400..700', 'serif'],
        'Marcellus' => ['Marcellus', 'serif'],
        'Poppins' => ['Poppins:ital,wght@0,400;0,500;0,600;1,400;1,500', 'sans-serif'],
        'Montserrat' => ['Montserrat:ital,wght@0,400..700;1,400..700', 'sans-serif'],
        'Outfit' => ['Outfit:wght@300..700', 'sans-serif'],
    ];

    public const BODY_FONTS = [
        'Afacad' => ['Afacad:ital,wght@0,400..700;1,400..700', 'sans-serif'],
        'Nunito Sans' => ['Nunito+Sans:ital,opsz,wght@0,6..12,300..800;1,6..12,400', 'sans-serif'],
        'Archivo' => ['Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900', 'sans-serif'],
        'Plus Jakarta Sans' => ['Plus+Jakarta+Sans:ital,wght@0,300..700;1,400', 'sans-serif'],
        'Inter' => ['Inter:wght@300..700', 'sans-serif'],
        'DM Sans' => ['DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400', 'sans-serif'],
        'Manrope' => ['Manrope:wght@300..700', 'sans-serif'],
        'Roboto' => ['Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400', 'sans-serif'],
        'Open Sans' => ['Open+Sans:ital,wght@0,300..700;1,400', 'sans-serif'],
        'Poppins' => ['Poppins:wght@300;400;500;600', 'sans-serif'],
        'Jost' => ['Jost:wght@300..600', 'sans-serif'],
    ];

    public static function fontsUrl(): string
    {
        $s = Setting::allValues();
        $h = static::HEADING_FONTS[$s['font_heading']] ?? static::HEADING_FONTS['Nunito Sans'];
        $b = static::BODY_FONTS[$s['font_body']] ?? static::BODY_FONTS['Afacad'];
        $families = array_unique([$h[0], $b[0]]);

        return 'https://fonts.googleapis.com/css2?family='.implode('&family=', $families).'&display=swap';
    }

    public static function cssVariables(): string
    {
        $s = Setting::allValues();
        $heading = array_key_exists($s['font_heading'], static::HEADING_FONTS) ? $s['font_heading'] : 'Nunito Sans';
        $body = array_key_exists($s['font_body'], static::BODY_FONTS) ? $s['font_body'] : 'Afacad';

        $primary = static::hex($s['color_primary'], '#468BC2');
        $dark = static::hex($s['color_dark'], '#000000');
        $accent = static::hex($s['color_accent'], '#468BC2');
        $light = static::hex($s['color_light'], '#FFFFFF');
        $ink = static::hex($s['color_text'], '#000000');

        $vars = [
            '--font-display' => "\"$heading\", ".static::HEADING_FONTS[$heading][1],
            '--font-sans' => "\"$body\", ".static::BODY_FONTS[$body][1],
            '--c-primary' => static::rgb($primary),
            '--c-primary-light' => static::rgb(static::mix($primary, '#FFFFFF', 0.35)),
            '--c-primary-dark' => static::rgb(static::mix($primary, '#000000', 0.25)),
            '--c-accent' => static::rgb($accent),
            '--c-ink' => static::rgb($ink),
            '--c-dark-900' => static::rgb($dark),
            '--c-dark-800' => static::rgb(static::mix($dark, '#FFFFFF', 0.03)),
            '--c-dark' => static::rgb(static::mix($dark, '#FFFFFF', 0.06)),
            '--c-dark-700' => static::rgb(static::mix($dark, '#FFFFFF', 0.10)),
            '--c-dark-600' => static::rgb(static::mix($dark, '#FFFFFF', 0.18)),
            '--c-light-50' => static::rgb(static::mix($light, '#FFFFFF', 0.45)),
            '--c-light-100' => static::rgb($light),
            '--c-light' => static::rgb(static::mix($light, $ink, 0.025)),
            '--c-light-200' => static::rgb(static::mix($light, $ink, 0.06)),
            '--c-light-300' => static::rgb(static::mix($light, $ink, 0.12)),
        ];

        return ':root{'.implode('', array_map(fn ($k, $v) => "$k:$v;", array_keys($vars), $vars)).'}';
    }

    public static function themeColor(): string
    {
        return static::hex(Setting::allValues()['color_dark'] ?? '', '#000000');
    }

    private static function hex(?string $value, string $fallback): string
    {
        return preg_match('/^#[0-9a-fA-F]{6}$/', (string) $value) ? strtoupper($value) : $fallback;
    }

    private static function rgb(string $hex): string
    {
        return implode(' ', array_map('hexdec', str_split(ltrim($hex, '#'), 2)));
    }

    private static function mix(string $a, string $b, float $t): string
    {
        $ca = array_map('hexdec', str_split(ltrim($a, '#'), 2));
        $cb = array_map('hexdec', str_split(ltrim($b, '#'), 2));

        return '#'.implode('', array_map(fn ($x, $y) => sprintf('%02X', round($x + ($y - $x) * $t)), $ca, $cb));
    }
}
