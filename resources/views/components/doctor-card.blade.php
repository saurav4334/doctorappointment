@props([
    'doctor',
    'layout' => 'vertical',     // vertical (grid/featured) | horizontal (listing)
    'showSchedule' => false,    // show a weekly availability summary (horizontal)
    'hospitalContext' => null,  // preserve hospital context in the booking URL
])

@php
    $fallback = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80';
    $photo = $doctor->photo ? (\Illuminate\Support\Str::startsWith($doctor->photo, ['http://', 'https://']) ? $doctor->photo : \Illuminate\Support\Facades\Storage::disk('public')->url($doctor->photo)) : $fallback;
    $specialty = $doctor->specializations[0] ?? 'General';
    $hospital = $doctor->hospital_label;
    $fee = rtrim(rtrim(number_format((float) $doctor->consultation_fee, 0), '0'), '.') ?: (int) $doctor->consultation_fee;
    $url = route('doctors.show', $doctor->slug).($hospitalContext ? '?hospital='.$hospitalContext : '');

    $scheduleSummary = null;
    if ($showSchedule && $doctor->relationLoaded('schedules')) {
        $dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        $scheduleSummary = $doctor->schedules
            ->pluck('day_of_week')->unique()->sort()
            ->map(fn ($d) => $dayNames[$d] ?? null)->filter()->implode(', ') ?: null;
    }
@endphp

@if ($layout === 'horizontal')
    <div {{ $attributes->merge(['class' => 'overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg']) }}>
        <div class="flex gap-4 p-4">
            <div class="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg">
                <img src="{{ $photo }}" alt="{{ $doctor->full_name }}" loading="lazy" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1">
                <div class="flex items-start justify-between">
                    <div>
                        <span class="text-xs font-medium text-primary">{{ $specialty }}</span>
                        <h3 class="font-display text-lg font-semibold text-foreground">{{ $doctor->full_name }}</h3>
                        <p class="text-sm text-muted-foreground">{{ $doctor->title }}</p>
                    </div>
                    @if ($doctor->rating > 0)
                        <div class="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-sm">
                            <svg class="h-3.5 w-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            <span class="font-medium text-amber-700">{{ $doctor->rating }}</span>
                        </div>
                    @endif
                </div>
                @if ($hospital)
                    <p class="mt-2 text-sm text-muted-foreground">{{ $hospital }}</p>
                @endif
                @if ($scheduleSummary)
                    <p class="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <svg class="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0V11.25A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
                        Available: {{ $scheduleSummary }}
                    </p>
                @endif
            </div>
        </div>
        <div class="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
            <div class="flex items-center gap-4 text-sm">
                <span class="text-muted-foreground">{{ $doctor->experience_years }} yrs exp</span>
                <span class="font-semibold text-primary">৳{{ $fee }}</span>
            </div>
            <x-btn :href="$url" variant="hero" size="sm">Book Now</x-btn>
        </div>
    </div>
@else
    <a href="{{ $url }}"
       {{ $attributes->merge(['class' => 'group block h-full overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg']) }}>
        <div class="relative aspect-[4/3] overflow-hidden">
            <img src="{{ $photo }}" alt="{{ $doctor->full_name }}, {{ $specialty }}" loading="lazy"
                 class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            @if ($doctor->rating > 0)
                <div class="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                    <svg class="h-3 w-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <span>{{ $doctor->rating }}</span>
                    <span class="text-muted-foreground">({{ $doctor->total_reviews }})</span>
                </div>
            @endif
        </div>
        <div class="p-4">
            <div class="text-xs font-medium text-primary">{{ $specialty }}</div>
            <h3 class="mt-1 font-display text-lg font-semibold text-foreground">{{ $doctor->full_name }}</h3>
            <p class="mt-0.5 text-sm text-muted-foreground">{{ $doctor->title }}</p>
            @if ($hospital)
                <p class="mt-2 text-sm text-muted-foreground">{{ $hospital }}</p>
            @endif
            <div class="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div>
                    <span class="text-xs text-muted-foreground">Experience</span>
                    <p class="text-sm font-medium">{{ $doctor->experience_years }} Years</p>
                </div>
                <div class="text-right">
                    <span class="text-xs text-muted-foreground">Fee</span>
                    <p class="text-sm font-semibold text-primary">৳{{ $fee }}</p>
                </div>
            </div>
            <span class="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-200 group-hover:bg-primary/90">
                Book Appointment
            </span>
        </div>
    </a>
@endif
