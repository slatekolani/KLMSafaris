<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="{{ \App\Support\Theme::themeColor() }}">
        @php
            // Search & share tags, worked out on the server so crawlers and link previews see them (see App\Support\Seo).
            $seo = \App\Support\Seo::fromPage($page);
            $page['props']['seo'] = $seo;
        @endphp
        <title inertia>{{ $seo['title'] }}</title>
        <meta inertia="description" name="description" content="{{ $seo['description'] }}">
        <meta inertia="robots" name="robots" content="{{ $seo['robots'] }}">
        <link inertia="canonical" rel="canonical" href="{{ $seo['url'] }}">
        <meta inertia="og:site_name" property="og:site_name" content="{{ $seo['site'] }}">
        <meta inertia="og:type" property="og:type" content="{{ $seo['type'] }}">
        <meta inertia="og:title" property="og:title" content="{{ $seo['title'] }}">
        <meta inertia="og:description" property="og:description" content="{{ $seo['description'] }}">
        <meta inertia="og:url" property="og:url" content="{{ $seo['url'] }}">
        <meta inertia="og:locale" property="og:locale" content="en_GB">
        @if ($seo['image'])
        <meta inertia="og:image" property="og:image" content="{{ $seo['image'] }}">
        <meta inertia="og:image:alt" property="og:image:alt" content="{{ $seo['title'] }}">
        @endif
        @if ($seo['published'])
        <meta inertia="article:published_time" property="article:published_time" content="{{ $seo['published'] }}">
        @endif
        <meta inertia="twitter:card" name="twitter:card" content="summary_large_image">
        <meta inertia="twitter:title" name="twitter:title" content="{{ $seo['title'] }}">
        <meta inertia="twitter:description" name="twitter:description" content="{{ $seo['description'] }}">
        @if ($seo['image'])
        <meta inertia="twitter:image" name="twitter:image" content="{{ $seo['image'] }}">
        @endif
        @if ($seo['twitter'])
        <meta inertia="twitter:site" name="twitter:site" content="{{ $seo['twitter'] }}">
        @endif
        @if ($seo['schema'])
        <script inertia="schema" type="application/ld+json">{!! json_encode($seo['schema'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
        @endif
        <link rel="icon" href="{{ \App\Models\Setting::allValues()['favicon'] ?: '/favicon.ico' }}">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="{{ \App\Support\Theme::fontsUrl() }}" rel="stylesheet">
        <style>{!! \App\Support\Theme::cssVariables() !!}</style>
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
