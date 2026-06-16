@extends('layouts.public')

@section('title', 'Hospitals & Chambers — Doctors AppointmentBD')
@section('meta_description', 'Browse partner hospitals and chambers and view their doctors. Book appointments online.')

@section('content')
    <section class="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 md:py-16">
        <div class="container mx-auto px-4 text-center">
            <h1 class="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">Hospitals &amp; Chambers</h1>
            <p class="mt-4 text-lg text-muted-foreground">Explore our partner facilities and find doctors near you.</p>
        </div>
    </section>

    <section class="py-12 md:py-16">
        <div class="container mx-auto px-4">
            @if ($hospitals->isEmpty())
                <p class="py-16 text-center text-lg text-muted-foreground">No hospitals listed yet.</p>
            @else
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    @foreach ($hospitals as $hospital)
                        @php
                            $img = $hospital->image
                                ? (\Illuminate\Support\Str::startsWith($hospital->image, ['http://','https://']) ? $hospital->image : \Illuminate\Support\Facades\Storage::disk('public')->url($hospital->image))
                                : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80';
                        @endphp
                        <a href="{{ route('hospitals.show', $hospital->slug) }}"
                           class="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div class="aspect-[16/9] overflow-hidden bg-muted">
                                <img src="{{ $img }}" alt="{{ $hospital->name }}" loading="lazy" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            <div class="p-5">
                                <h3 class="font-display text-lg font-semibold text-foreground">{{ $hospital->name }}</h3>
                                @if ($hospital->city)
                                    <p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                        {{ $hospital->city }}
                                    </p>
                                @endif
                                <div class="mt-4 flex items-center justify-between">
                                    <span class="text-sm text-muted-foreground">{{ $hospital->doctors_count }} {{ \Illuminate\Support\Str::plural('doctor', $hospital->doctors_count) }}</span>
                                    <span class="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
                                        View Doctors
                                        <svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
                                    </span>
                                </div>
                            </div>
                        </a>
                    @endforeach
                </div>

                <div class="mt-10">{{ $hospitals->links() }}</div>
            @endif
        </div>
    </section>
@endsection
