@php
    $wrapper = $placement === 'sidebar' ? '' : 'container mx-auto px-4';
    $inner = 'block w-full overflow-hidden rounded-2xl shadow-sm '.$aspect;
@endphp

<div role="complementary" aria-label="Advertisement" {{ $attributes->merge(['class' => $wrapper]) }}>
    @if ($href)
        <a href="{{ $href }}"
           @if ($external) target="_blank" rel="noopener noreferrer nofollow sponsored" @endif
           class="{{ $inner }}">
            <img src="{{ $imageUrl }}" alt="{{ $ad->title }}" loading="lazy" decoding="async" class="h-full w-full object-cover" />
        </a>
    @else
        <div class="{{ $inner }}">
            <img src="{{ $imageUrl }}" alt="{{ $ad->title }}" loading="lazy" decoding="async" class="h-full w-full object-cover" />
        </div>
    @endif
</div>
