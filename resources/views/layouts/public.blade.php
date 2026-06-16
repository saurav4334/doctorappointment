<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'Doctors AppointmentBD')</title>
    <meta name="description" content="@yield('meta_description', 'Find experienced and highly rated specialist doctors near you. Book appointments online.')">

    {{-- Open Graph --}}
    <meta property="og:title" content="@yield('title', 'Doctors AppointmentBD')">
    <meta property="og:description" content="@yield('meta_description', 'Book appointments with trusted specialist doctors.')">
    <meta property="og:type" content="website">
    <meta property="og:image" content="{{ asset('og-image.png') }}">
    <meta property="og:url" content="{{ url()->current() }}">

    <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>[x-cloak]{display:none !important;}</style>
    @stack('head')
</head>
<body class="min-h-screen bg-background font-sans text-foreground">
    @include('partials.support-bar')
    @include('partials.header')

    <main>
        @yield('content')
    </main>

    @include('partials.footer')

    @stack('scripts')
</body>
</html>
