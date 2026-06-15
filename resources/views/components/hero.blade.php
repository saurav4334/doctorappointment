@props(['slides' => collect()])

@php
    $fallbackImage = 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80';

    $items = collect($slides)->map(function ($s) use ($fallbackImage) {
        $img = $s->image
            ? (\Illuminate\Support\Str::startsWith($s->image, ['http://', 'https://']) ? $s->image : \Illuminate\Support\Facades\Storage::disk('public')->url($s->image))
            : $fallbackImage;
        return [
            'title' => $s->title,
            'subtitle' => $s->subtitle,
            'image' => $img,
            'button_text' => $s->button_text,
            'button_url' => $s->button_url,
        ];
    })->values();

    if ($items->isEmpty()) {
        $items = collect([[
            'title' => 'Healthcare Anytime, Anywhere',
            'subtitle' => 'Let us take care of your health',
            'image' => $fallbackImage,
            'button_text' => 'Explore Our Services',
            'button_url' => url('/doctors'),
        ]]);
    }
@endphp

<section
    x-data="{
        current: 0,
        count: {{ $items->count() }},
        timer: null,
        init() {
            if (this.count > 1) {
                this.timer = setInterval(() => this.next(), 6000);
            }
        },
        next() { this.current = (this.current + 1) % this.count; },
        prev() { this.current = (this.current - 1 + this.count) % this.count; },
        go(i) { this.current = i; },
    }"
    class="relative h-[600px] overflow-hidden md:h-[700px] lg:h-[85vh]">

    @foreach ($items as $index => $slide)
        <div x-show="current === {{ $index }}" x-transition.opacity.duration.1000ms class="absolute inset-0">
            <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('{{ $slide['image'] }}')">
                <div class="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent"></div>
            </div>
            <div class="container relative mx-auto flex h-full items-center px-4">
                <div class="max-w-xl text-background">
                    <h1 class="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                        {{ $slide['title'] }}
                    </h1>
                    @if ($slide['subtitle'])
                        <p class="mt-4 text-lg text-white/90 md:mt-6 md:text-xl">{{ $slide['subtitle'] }}</p>
                    @endif
                    @if ($slide['button_text'] && $slide['button_url'])
                        <div class="mt-6 md:mt-8">
                            <x-btn :href="$slide['button_url']" variant="hero" size="xl">{{ $slide['button_text'] }}</x-btn>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    @endforeach

    @if ($items->count() > 1)
        <button @click="prev()" aria-label="Previous slide"
                class="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/40">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
        </button>
        <button @click="next()" aria-label="Next slide"
                class="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/40">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
        </button>
        <div class="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            @foreach ($items as $index => $slide)
                <button @click="go({{ $index }})" aria-label="Go to slide {{ $index + 1 }}"
                        class="h-2 rounded-full transition-all"
                        :class="current === {{ $index }} ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white/70'"></button>
            @endforeach
        </div>
    @endif
</section>
