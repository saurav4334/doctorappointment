@props(['padding' => 'p-5'])

<div {{ $attributes->merge(['class' => 'rounded-xl border border-border bg-background shadow-sm '.$padding]) }}>
    {{ $slot }}
</div>
