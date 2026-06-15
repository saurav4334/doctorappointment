<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin') · Doctors AppointmentBD</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>[x-cloak]{display:none !important;}</style>
    @stack('head')
</head>
<body class="min-h-screen bg-muted/30 font-sans text-foreground antialiased" x-data="{ sidebarOpen: false }">

    @php
        $nav = [
            ['label' => 'Dashboard', 'route' => 'admin.dashboard', 'pattern' => 'admin.dashboard', 'icon' => 'M2.25 12 11.2 3.05a1.13 1.13 0 0 1 1.6 0L21.75 12M4.5 9.75v10.13c0 .62.5 1.12 1.13 1.12h3.37v-6.75h4.5V21h3.38c.62 0 1.12-.5 1.12-1.13V9.75'],
            ['label' => 'Doctors', 'route' => 'admin.doctors.index', 'pattern' => 'admin.doctors.*', 'icon' => 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0'],
            ['label' => 'Departments', 'route' => 'admin.departments.index', 'pattern' => 'admin.departments.*', 'icon' => 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'],
            ['label' => 'Hospitals', 'route' => 'admin.hospitals.index', 'pattern' => 'admin.hospitals.*', 'icon' => 'M3.75 21h16.5M4.5 3v18m15-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21'],
            ['label' => 'Advertisements', 'route' => 'admin.advertisements.index', 'pattern' => 'admin.advertisements.*', 'icon' => 'M10.34 15.84c-.69.46-1.51.66-2.34.66H5.25a2.25 2.25 0 0 1 0-4.5H8c.83 0 1.65.2 2.34.66M10.34 8.16 16.5 4.5v15l-6.16-3.66M21 12a3 3 0 0 1-3 3'],
            ['label' => 'Hero Slides', 'route' => 'admin.hero-slides.index', 'pattern' => 'admin.hero-slides.*', 'icon' => 'm2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.18 0l5.16 5.16m-1.5-1.5 1.41-1.41a2.25 2.25 0 0 1 3.18 0l2.16 2.16M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z'],
            ['label' => 'Appointments', 'route' => 'admin.appointments.index', 'pattern' => 'admin.appointments.*', 'icon' => 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0V11.25A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5'],
        ];
    @endphp

    {{-- Mobile overlay --}}
    <div x-show="sidebarOpen" x-cloak @click="sidebarOpen = false" class="fixed inset-0 z-30 bg-black/50 lg:hidden"></div>

    {{-- Sidebar --}}
    <aside
        class="fixed inset-y-0 left-0 z-40 w-64 transform bg-primary text-primary-foreground transition-transform duration-200 lg:translate-x-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'">
        <div class="flex h-16 items-center gap-3 border-b border-white/10 px-5">
            <img src="{{ asset('favicon.png') }}" alt="" class="h-8 w-8 rounded-lg object-contain bg-white/10 p-1">
            <span class="font-display text-lg font-bold">Admin Panel</span>
        </div>
        <nav class="flex flex-col gap-1 p-3">
            @foreach ($nav as $item)
                @php $active = request()->routeIs($item['pattern']); @endphp
                <a href="{{ route($item['route']) }}"
                   class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors {{ $active ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white' }}">
                    <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="{{ $item['icon'] }}"/></svg>
                    {{ $item['label'] }}
                </a>
            @endforeach
        </nav>
        <div class="absolute bottom-0 w-full border-t border-white/10 p-3">
            <a href="{{ url('/') }}" target="_blank" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                View Site
            </a>
        </div>
    </aside>

    <div class="lg:pl-64">
        {{-- Topbar --}}
        <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
            <div class="flex items-center gap-3">
                <button @click="sidebarOpen = true" class="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Open menu">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
                </button>
                <h1 class="font-display text-lg font-semibold text-foreground">@yield('heading', 'Dashboard')</h1>
            </div>
            <div x-data="{ open: false }" class="relative">
                <button @click="open = !open" class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                    <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{{ Str::substr(auth()->user()->name ?? 'A', 0, 1) }}</span>
                    <span class="hidden font-medium md:inline">{{ auth()->user()->name ?? 'Admin' }}</span>
                </button>
                <div x-show="open" x-cloak @click.outside="open = false" class="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-background py-1 shadow-lg">
                    <a href="{{ route('profile.edit') }}" class="block px-4 py-2 text-sm hover:bg-muted">Profile</a>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted">Log Out</button>
                    </form>
                </div>
            </div>
        </header>

        {{-- Flash messages --}}
        <div class="px-4 pt-4 md:px-6">
            @if (session('success'))
                <div x-data="{ show: true }" x-show="show" class="mb-2 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <span>{{ session('success') }}</span>
                    <button @click="show = false" class="text-green-600 hover:text-green-800">&times;</button>
                </div>
            @endif
            @if (session('error'))
                <div x-data="{ show: true }" x-show="show" class="mb-2 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <span>{{ session('error') }}</span>
                    <button @click="show = false" class="text-red-600 hover:text-red-800">&times;</button>
                </div>
            @endif
            @if ($errors->any())
                <div class="mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <p class="font-medium">Please fix the following:</p>
                    <ul class="mt-1 list-inside list-disc">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
        </div>

        <main class="p-4 md:p-6">
            @yield('content')
        </main>
    </div>

    @stack('scripts')
</body>
</html>
