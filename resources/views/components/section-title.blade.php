@props([
    'eyebrow' => null,
    'title' => '',
    'subtitle' => null,
    'align' => 'left', // left | center
])

<div {{ $attributes->merge(['class' => $align === 'center' ? 'mx-auto max-w-2xl text-center' : '']) }}>
    @if ($eyebrow)
        <span class="text-sm font-semibold uppercase tracking-wider text-primary">{{ $eyebrow }}</span>
    @endif
    <h2 class="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">{{ $title }}</h2>
    @if ($subtitle)
        <p class="mt-2 {{ $align === 'center' ? 'mx-auto' : '' }} max-w-xl text-muted-foreground">{{ $subtitle }}</p>
    @endif
</div>
