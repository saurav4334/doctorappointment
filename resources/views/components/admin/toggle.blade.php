@props([
    'name' => '',
    'label' => '',
    'checked' => false,
    'hint' => null,
])

@php $isChecked = (bool) old($name, $checked); @endphp

<div x-data="{ on: @js($isChecked) }" class="flex items-center justify-between gap-4">
    <div>
        <span class="text-sm font-medium text-foreground">{{ $label }}</span>
        @if ($hint)<p class="text-xs text-muted-foreground">{{ $hint }}</p>@endif
    </div>
    {{-- Always submit a value (0 when off, 1 when on) --}}
    <input type="hidden" name="{{ $name }}" :value="on ? 1 : 0">
    <button type="button" @click="on = !on"
            :class="on ? 'bg-primary' : 'bg-muted-foreground/30'"
            class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
        <span :class="on ? 'translate-x-6' : 'translate-x-1'" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
    </button>
</div>
