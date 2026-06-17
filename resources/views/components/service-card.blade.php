@props(['service'])

@php
    $image = $service->image
        ? (\Illuminate\Support\Str::startsWith($service->image, ['http://', 'https://']) ? $service->image : \Illuminate\Support\Facades\Storage::disk('public')->url($service->image))
        : null;
@endphp

<a href="{{ route('services.show', $service->slug) }}"
   {{ $attributes->merge(['class' => 'group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg']) }}>
    <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-2xl text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        @if ($image)
            <img src="{{ $image }}" alt="{{ $service->title }}" loading="lazy" class="h-full w-full object-cover">
        @else
            <span>{{ $service->icon ?: '🩺' }}</span>
        @endif
    </div>
    <h3 class="mt-4 font-display text-base font-semibold text-foreground">{{ $service->title }}</h3>
    @if ($service->description)
        <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ $service->description }}</p>
    @endif
    <span class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
        Learn more
        <svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
    </span>
</a>
