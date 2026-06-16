@extends('layouts.public')

@section('title', 'Doctors AppointmentBD — Book Trusted Specialist Doctors')
@section('meta_description', 'Find experienced and highly rated specialist doctors near you. Book appointments online with trusted hospitals across Bangladesh.')

@section('content')
    {{-- 1. Hero --}}
    <x-hero :slides="$heroSlides" />

    {{-- 2. Advertisement banner (below hero) --}}
    <x-ad-banner placement="hero_bottom" class="mt-6" />

    {{-- 3. Top Rated Doctors --}}
    @if ($featuredDoctors->isNotEmpty())
        <section class="py-16 md:py-24">
            <div class="container mx-auto px-4">
                <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <x-section-title
                        eyebrow="Our Experts"
                        title="Top Rated Doctors"
                        subtitle="Find experienced and highly rated specialist doctors near you." />
                    <x-btn href="{{ route('doctors.index') }}" variant="outline">View All Doctors</x-btn>
                </div>

                <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    @foreach ($featuredDoctors->take(4) as $doctor)
                        <x-doctor-card :doctor="$doctor" />
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    {{-- Advertisement banner (between Top Rated Doctors and Departments) --}}
    <x-ad-banner placement="mid_homepage" class="my-2" />

    {{-- 4. Departments --}}
    @if ($departments->isNotEmpty())
        <section id="departments" class="scroll-mt-24 bg-muted/40 py-16 md:py-24">
            <div class="container mx-auto px-4">
                <x-section-title align="center" eyebrow="Specialties"
                    title="Browse by Department"
                    subtitle="Explore our medical specialties and find the right care for you." />

                <div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    @foreach ($departments as $department)
                        <a href="{{ route('doctors.index', ['department' => $department->slug]) }}"
                           class="group flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                @if ($department->icon)
                                    <span>{{ $department->icon }}</span>
                                @else
                                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
                                @endif
                            </div>
                            <h3 class="mt-4 font-display text-base font-semibold text-foreground">{{ $department->name }}</h3>
                            @if ($department->description)
                                <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ $department->description }}</p>
                            @endif
                        </a>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    {{-- 5. Hospitals --}}
    @if ($hospitals->isNotEmpty())
        <section id="hospitals" class="scroll-mt-24 py-16 md:py-24">
            <div class="container mx-auto px-4">
                <x-section-title align="center" eyebrow="Our Network"
                    title="Partner Hospitals & Chambers"
                    subtitle="Quality healthcare facilities you can trust." />

                <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    @foreach ($hospitals as $hospital)
                        @php
                            $himg = $hospital->image
                                ? (\Illuminate\Support\Str::startsWith($hospital->image, ['http://','https://']) ? $hospital->image : \Illuminate\Support\Facades\Storage::disk('public')->url($hospital->image))
                                : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80';
                        @endphp
                        <a href="{{ route('hospitals.show', $hospital->slug) }}"
                           class="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div class="aspect-[16/9] overflow-hidden bg-muted">
                                <img src="{{ $himg }}" alt="{{ $hospital->name }}" loading="lazy" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            <div class="p-5">
                                <h3 class="font-display text-lg font-semibold text-foreground">{{ $hospital->name }}</h3>
                                @if ($hospital->city)
                                    <p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                        {{ $hospital->city }}
                                    </p>
                                @endif
                                @if ($hospital->description)
                                    <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{{ $hospital->description }}</p>
                                @endif
                                <span class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
                                    View Doctors
                                    <svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
                                </span>
                            </div>
                        </a>
                    @endforeach
                </div>

                <div class="mt-10 text-center">
                    <x-btn href="{{ route('hospitals.index') }}" variant="outline">View All Hospitals</x-btn>
                </div>
            </div>
        </section>
    @endif

    {{-- 6. Testimonials --}}
    @if ($testimonials->isNotEmpty())
        <section class="bg-muted/40 py-16 md:py-24">
            <div class="container mx-auto px-4">
                <x-section-title align="center" eyebrow="Testimonials"
                    title="What Our Patients Say"
                    subtitle="Real stories from people we've cared for." />

                <div class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    @foreach ($testimonials as $t)
                        @php
                            $timg = $t->image
                                ? (\Illuminate\Support\Str::startsWith($t->image, ['http://','https://']) ? $t->image : \Illuminate\Support\Facades\Storage::disk('public')->url($t->image))
                                : 'https://ui-avatars.com/api/?name='.urlencode($t->patient_name).'&background=1e3a5f&color=fff';
                        @endphp
                        <figure class="flex h-full flex-col rounded-xl border border-border bg-card p-6">
                            <div class="flex gap-0.5 text-amber-400">
                                @for ($i = 0; $i < 5; $i++)
                                    <svg class="h-4 w-4 {{ $i < $t->rating ? 'fill-amber-400' : 'fill-muted text-muted' }}" viewBox="0 0 24 24"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                @endfor
                            </div>
                            <blockquote class="mt-4 flex-1 text-muted-foreground">"{{ $t->review }}"</blockquote>
                            <figcaption class="mt-5 flex items-center gap-3">
                                <img src="{{ $timg }}" alt="{{ $t->patient_name }}" loading="lazy" class="h-10 w-10 rounded-full object-cover" />
                                <span class="font-semibold text-foreground">{{ $t->patient_name }}</span>
                            </figcaption>
                        </figure>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    {{-- Footer banner ad + CTA --}}
    <x-cta-section />

    {{-- Footer sponsor strip (after CTA, just before the footer) --}}
    <x-ad-banner placement="footer_banner" class="mb-8" />
@endsection
