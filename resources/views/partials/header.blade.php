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
    {{-- Top bar --}}
    <div class="hidden bg-primary px-4 py-2 text-primary-foreground md:block">
        <div class="container mx-auto flex items-center justify-between text-sm">
            <div class="flex items-center gap-6">
                <a href="tel:+8809678123456" class="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
                    <span>+880 9678 123456</span>
                </a>
                <span>Emergency: 24/7 Support Available</span>
            </div>
            <div class="flex items-center gap-4">
                <a href="{{ route('login') }}" class="hover:underline">My Account</a>
                <span>|</span>
                <a href="{{ url('/hospital-register') }}" class="hover:underline">Register Your Hospital</a>
            </div>
        </div>
    </div>

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
