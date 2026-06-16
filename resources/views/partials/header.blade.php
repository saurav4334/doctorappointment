@php
    $nav = [
        ['label' => 'Home', 'url' => url('/')],
        ['label' => 'Our Doctors', 'url' => url('/doctors')],
        ['label' => 'Departments', 'url' => url('/').'#departments'],
        ['label' => 'Hospitals', 'url' => route('hospitals.index')],
        ['label' => 'About', 'url' => url('/about')],
        ['label' => 'Contact', 'url' => url('/contact')],
    ];
@endphp

<header x-data="{ mobileOpen: false }"
        class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    {{-- Main header --}}
    <div class="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
        <a href="{{ url('/') }}" class="flex items-center gap-2">
            <img src="{{ asset('logo.png') }}" alt="Doctors AppointmentBD" class="h-10 object-contain" />
        </a>

        {{-- Desktop nav --}}
        <nav class="hidden items-center gap-1 lg:flex">
            @foreach ($nav as $item)
                @php $active = request()->url() === $item['url']; @endphp
                <a href="{{ $item['url'] }}"
                   class="px-4 py-2 text-sm font-medium transition-colors hover:text-primary {{ $active ? 'text-primary' : 'text-foreground' }}">
                    {{ $item['label'] }}
                </a>
            @endforeach
        </nav>

        {{-- Desktop CTAs --}}
        <div class="hidden items-center gap-3 lg:flex">
            <x-btn href="{{ route('login') }}" variant="ghost" size="sm">Sign In</x-btn>
            <x-btn href="{{ url('/doctors') }}" variant="hero">Book Appointment</x-btn>
        </div>

        {{-- Mobile toggle --}}
        <button class="rounded-md p-2 lg:hidden" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
            <svg x-show="!mobileOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            <svg x-show="mobileOpen" x-cloak class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
    </div>

    {{-- Mobile menu --}}
    <div x-show="mobileOpen" x-cloak class="border-t bg-background px-4 py-4 lg:hidden">
        <nav class="flex flex-col gap-2">
            @foreach ($nav as $item)
                <a href="{{ $item['url'] }}" class="block rounded-md px-4 py-3 text-sm font-medium hover:bg-accent">{{ $item['label'] }}</a>
            @endforeach
            <div class="mt-4 flex flex-col gap-2">
                <x-btn href="{{ route('login') }}" variant="outline" class="w-full">Sign In</x-btn>
                <x-btn href="{{ url('/doctors') }}" variant="hero" class="w-full">Book Appointment</x-btn>
            </div>
        </nav>
    </div>
</header>
