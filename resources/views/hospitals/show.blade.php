@extends('layouts.public')

@php
    use Illuminate\Support\Str;
    use Illuminate\Support\Facades\Storage;

    $image = $hospital->image
        ? (Str::startsWith($hospital->image, ['http://', 'https://']) ? $hospital->image : Storage::disk('public')->url($hospital->image))
        : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80';
@endphp

@section('title', $hospital->name.' — Doctors & Appointments')
@section('meta_description', Str::limit(strip_tags($hospital->description ?: 'Book appointments with doctors at '.$hospital->name.($hospital->city ? ', '.$hospital->city : '')), 155))

@section('content')
    {{-- Breadcrumb --}}
    <div class="border-b bg-muted/30 py-3">
        <div class="container mx-auto px-4">
            <nav class="flex items-center gap-2 text-sm text-muted-foreground">
                <a href="{{ url('/') }}" class="hover:text-primary">Home</a>
                <span>/</span>
                <a href="{{ route('hospitals.index') }}" class="hover:text-primary">Hospitals</a>
                <span>/</span>
                <span class="text-foreground">{{ $hospital->name }}</span>
            </nav>
        </div>
    </div>

    {{-- Hospital header --}}
    <section class="container mx-auto px-4 py-8 md:py-10">
        <div class="grid gap-6 md:grid-cols-3">
            <div class="md:col-span-1">
                <div class="aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted">
                    <img src="{{ $image }}" alt="{{ $hospital->name }}" class="h-full w-full object-cover" />
                </div>
            </div>
            <div class="md:col-span-2">
                <h1 class="font-display text-2xl font-bold text-foreground md:text-3xl">{{ $hospital->name }}</h1>

                <div class="mt-4 space-y-2 text-sm text-muted-foreground">
                    @if ($hospital->address || $hospital->city)
                        <p class="flex items-start gap-2">
                            <svg class="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                            <span>{{ collect([$hospital->address, $hospital->city])->filter()->implode(', ') }}</span>
                        </p>
                    @endif
                    @if ($hospital->contact_number)
                        <p class="flex items-center gap-2">
                            <svg class="h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
                            <a href="tel:{{ $hospital->contact_number }}" class="hover:text-primary">{{ $hospital->contact_number }}</a>
                        </p>
                    @endif
                </div>

                @if ($hospital->description)
                    <p class="mt-4 leading-relaxed text-muted-foreground">{{ $hospital->description }}</p>
                @endif

                <div class="mt-5 flex items-center gap-2 text-sm">
                    <span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                        {{ $doctors->count() }} {{ Str::plural('Doctor', $doctors->count()) }}
                    </span>
                </div>
            </div>
        </div>
    </section>

    {{-- Doctors at this hospital --}}
    <section class="bg-muted/40 py-12 md:py-16">
        <div class="container mx-auto px-4">
            <x-section-title eyebrow="Specialists" title="Doctors at {{ $hospital->name }}"
                subtitle="Choose a doctor and book your appointment." />

            @if ($doctors->isEmpty())
                <div class="mt-10 rounded-xl border border-dashed border-border bg-card p-12 text-center">
                    <p class="text-lg font-medium text-foreground">No doctors are currently listed for this hospital.</p>
                    <p class="mt-1 text-sm text-muted-foreground">Please check back soon or browse all doctors.</p>
                    <x-btn href="{{ route('doctors.index') }}" variant="outline" class="mt-5">Browse All Doctors</x-btn>
                </div>
            @else
                <div class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    @foreach ($doctors as $doctor)
                        <x-doctor-card :doctor="$doctor" layout="horizontal" :show-schedule="true" :hospital-context="$hospital->id" />
                    @endforeach
                </div>
            @endif
        </div>
    </section>
@endsection
