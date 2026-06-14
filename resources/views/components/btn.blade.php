@props([
    'href' => null,
    'variant' => 'default',
    'size' => 'default',
])

@php
    $base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    $variants = [
        'default'     => 'bg-primary text-primary-foreground hover:bg-primary/90',
        'hero'        => 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
        'heroOutline' => 'border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary',
        'outline'     => 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        'ghost'       => 'text-foreground hover:bg-accent hover:text-accent-foreground',
        'secondary'   => 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    ];

    $sizes = [
        'sm'      => 'h-9 px-3 text-sm',
        'default' => 'h-10 px-5 text-sm',
        'lg'      => 'h-11 px-8 text-base',
        'xl'      => 'h-14 rounded-xl px-10 text-lg',
    ];

    $classes = trim($base.' '.($variants[$variant] ?? $variants['default']).' '.($sizes[$size] ?? $sizes['default']));
@endphp

@if ($href)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => $classes]) }}>{{ $slot }}</a>
@else
    <button {{ $attributes->merge(['class' => $classes, 'type' => 'button']) }}>{{ $slot }}</button>
@endif
