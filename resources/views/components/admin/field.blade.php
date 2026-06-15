@props([
    'name' => '',
    'label' => '',
    'required' => false,
    'hint' => null,
])

<div {{ $attributes->only('class') }}>
    @if ($label)
        <label for="{{ $name }}" class="mb-1.5 block text-sm font-medium text-foreground">
            {{ $label }} @if ($required)<span class="text-destructive">*</span>@endif
        </label>
    @endif
    {{ $slot }}
    @if ($hint)
        <p class="mt-1 text-xs text-muted-foreground">{{ $hint }}</p>
    @endif
    @error($name)
        <p class="mt-1 text-xs text-destructive">{{ $message }}</p>
    @enderror
</div>
