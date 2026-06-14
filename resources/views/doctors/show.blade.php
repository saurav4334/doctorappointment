@extends('layouts.public')

@php
    use Illuminate\Support\Str;
    use Illuminate\Support\Facades\Storage;

    $fallback = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80';
    $photo = $doctor->photo ? (Str::startsWith($doctor->photo, ['http://','https://']) ? $doctor->photo : Storage::url($doctor->photo)) : $fallback;
    $specialty = $doctor->specializations[0] ?? 'General Physician';
    $hospitalName = $doctor->hospital_label ?? 'Hospital';
    $location = $doctor->hospital?->city ?? 'Dhaka';
    $fee = (int) $doctor->consultation_fee;
    $days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
@endphp

@section('title', $doctor->full_name.' — '.$specialty)
@section('meta_description', Str::limit(strip_tags($doctor->bio ?: $doctor->full_name.', '.$specialty.' at '.$hospitalName), 155))

@section('content')
    {{-- Breadcrumb --}}
    <div class="border-b bg-muted/30 py-3">
        <div class="container mx-auto px-4">
            <nav class="flex items-center gap-2 text-sm text-muted-foreground">
                <a href="{{ url('/') }}" class="hover:text-primary">Home</a>
                <span>/</span>
                <a href="{{ route('doctors.index') }}" class="hover:text-primary">Doctors</a>
                <span>/</span>
                <span class="text-foreground">{{ $doctor->full_name }}</span>
            </nav>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8 md:py-12">
        <div class="grid gap-8 lg:grid-cols-3">
            {{-- Main --}}
            <div class="lg:col-span-2">
                {{-- Header card --}}
                <div class="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 md:flex-row">
                    <div class="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl md:h-48 md:w-48">
                        <img src="{{ $photo }}" alt="{{ $doctor->full_name }}" class="h-full w-full object-cover" />
                    </div>
                    <div class="flex-1">
                        <div class="flex items-start justify-between">
                            <div>
                                <span class="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{{ $specialty }}</span>
                                <h1 class="mt-2 font-display text-2xl font-bold text-foreground md:text-3xl">{{ $doctor->full_name }}</h1>
                                <p class="mt-1 text-muted-foreground">{{ $doctor->title ?: implode(', ', $doctor->qualifications ?? []) }}</p>
                            </div>
                            @if ($doctor->rating > 0)
                                <div class="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5">
                                    <svg class="h-5 w-5 fill-amber-400 text-amber-400" viewBox="0 0 24 24"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                    <span class="text-lg font-semibold text-amber-700">{{ $doctor->rating }}</span>
                                    <span class="text-sm text-amber-600">({{ $doctor->total_reviews }})</span>
                                </div>
                            @endif
                        </div>

                        <div class="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span class="flex items-center gap-1.5">
                                <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                {{ $hospitalName }}, {{ $location }}
                            </span>
                            @if ($doctor->experience_years)
                                <span class="flex items-center gap-1.5">
                                    <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                                    {{ $doctor->experience_years }} Years Experience
                                </span>
                            @endif
                        </div>

                        <div class="mt-4 flex flex-wrap items-center gap-4">
                            <div class="rounded-lg bg-primary/5 px-4 py-2">
                                <span class="text-sm text-muted-foreground">Consultation Fee</span>
                                <p class="text-xl font-bold text-primary">৳{{ $fee }}</p>
                            </div>
                            <x-btn href="tel:+8809678123456" variant="outline" size="lg">Call Now</x-btn>
                        </div>
                    </div>
                </div>

                {{-- About --}}
                @if ($doctor->bio)
                    <div class="mt-6 rounded-xl border border-border bg-card p-6">
                        <h2 class="font-display text-xl font-semibold text-foreground">About</h2>
                        <p class="mt-3 leading-relaxed text-muted-foreground">{{ $doctor->bio }}</p>
                    </div>
                @endif

                {{-- Qualifications --}}
                @if (!empty($doctor->qualifications))
                    <div class="mt-6 rounded-xl border border-border bg-card p-6">
                        <h2 class="font-display text-xl font-semibold text-foreground">Qualifications</h2>
                        <ul class="mt-4 space-y-2">
                            @foreach ($doctor->qualifications as $qual)
                                <li class="flex items-start gap-3 text-muted-foreground">
                                    <svg class="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                                    {{ $qual }}
                                </li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                {{-- Specializations --}}
                @if (!empty($doctor->specializations))
                    <div class="mt-6 rounded-xl border border-border bg-card p-6">
                        <h2 class="font-display text-xl font-semibold text-foreground">Specializations</h2>
                        <div class="mt-4 flex flex-wrap gap-2">
                            @foreach ($doctor->specializations as $spec)
                                <span class="rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">{{ $spec }}</span>
                            @endforeach
                        </div>
                    </div>
                @endif

                {{-- Weekly schedule --}}
                @if ($doctor->schedules->isNotEmpty())
                    <div class="mt-6 rounded-xl border border-border bg-card p-6">
                        <h2 class="font-display text-xl font-semibold text-foreground">Weekly Schedule</h2>
                        <div class="mt-4 overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b">
                                        <th class="pb-3 text-left font-medium text-muted-foreground">Day</th>
                                        <th class="pb-3 text-left font-medium text-muted-foreground">Time</th>
                                        <th class="pb-3 text-left font-medium text-muted-foreground">Hospital</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($doctor->schedules as $s)
                                        <tr class="border-b last:border-0">
                                            <td class="py-3 font-medium text-foreground">{{ $days[$s->day_of_week] ?? '' }}</td>
                                            <td class="py-3 text-muted-foreground">{{ \Illuminate\Support\Str::substr($s->start_time, 0, 5) }} - {{ \Illuminate\Support\Str::substr($s->end_time, 0, 5) }}</td>
                                            <td class="py-3 text-muted-foreground">{{ $s->hospital?->name ?? $hospitalName }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                @endif
            </div>

            {{-- Booking sidebar --}}
            <div class="lg:col-span-1">
                <div class="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div class="flex items-center justify-between">
                        <h3 class="font-display text-base font-semibold text-foreground">Book Appointment</h3>
                        <div class="text-right">
                            <span class="text-lg font-bold text-primary">৳{{ $fee + 50 }}</span>
                            <p class="text-xs text-muted-foreground">Total</p>
                        </div>
                    </div>

                    <dl class="mt-4 space-y-2 text-sm">
                        <div class="flex justify-between">
                            <dt class="text-muted-foreground">Consultation Fee</dt>
                            <dd class="font-medium text-foreground">৳{{ $fee }}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-muted-foreground">Service Charge</dt>
                            <dd class="font-medium text-foreground">৳50</dd>
                        </div>
                        <div class="flex justify-between border-t border-border pt-2">
                            <dt class="text-muted-foreground">Hospital</dt>
                            <dd class="text-right font-medium text-foreground">{{ $hospitalName }}</dd>
                        </div>
                    </dl>

                    <x-btn href="tel:+8809678123456" variant="hero" class="mt-5 w-full">Book Appointment</x-btn>
                    <p class="mt-3 text-center text-xs text-muted-foreground">Online booking flow coming soon — call us to confirm your slot.</p>
                </div>
            </div>
        </div>
    </div>
@endsection
