<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="{{ \App\Support\Theme::themeColor() }}">
        <title inertia>{{ config('app.name', 'KLM Safaris') }}</title>
        <link rel="icon" href="{{ \App\Models\Setting::allValues()['favicon'] ?: '/favicon.ico' }}">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="{{ \App\Support\Theme::fontsUrl() }}" rel="stylesheet">
        <style>{!! \App\Support\Theme::cssVariables() !!}</style>
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="antialiased">
        @inertia
    </body>
</html>
