@php
    $wrapper = $placement === 'sidebar' ? '' : 'container mx-auto px-4';
    $inner = 'group relative block w-full overflow-hidden rounded-2xl shadow-sm '.$sizeClass;
    // Desktop hover only applies when the banner is clickable.
    $hover = $href ? ' transition-transform duration-300 hover:scale-[1.01] hover:shadow-md' : '';
@endphp

<div role="complementary" aria-label="Advertisement" {{ $attributes->merge(['class' => $wrapper]) }}>
    @if ($href)
        <a href="{{ $href }}"
           @if ($external) target="_blank" rel="noopener noreferrer nofollow sponsored" @endif
           class="{{ $inner.$hover }}">
            <img src="{{ $imageUrl }}" alt="{{ $ad->title }}" loading="lazy" decoding="async" class="h-full w-full object-cover" />
            <span class="pointer-events-none absolute right-2 top-2 rounded bg-white/75 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 backdrop-blur-sm">Sponsored</span>
        </a>
    @else
        <div class="{{ $inner }}">
            <img src="{{ $imageUrl }}" alt="{{ $ad->title }}" loading="lazy" decoding="async" class="h-full w-full object-cover" />
            <span class="pointer-events-none absolute right-2 top-2 rounded bg-white/75 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 backdrop-blur-sm">Sponsored</span>
        </div>
    @endif
</div>
