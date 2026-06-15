@props([
    'name' => '',
    'label' => '',
    'type' => 'text',
    'value' => null,
    'required' => false,
    'placeholder' => '',
    'hint' => null,
])

<x-admin.field :name="$name" :label="$label" :required="$required" :hint="$hint">
    <input
        type="{{ $type }}"
        name="{{ $name }}"
        id="{{ $name }}"
        value="{{ old($name, $value) }}"
        @if ($placeholder) placeholder="{{ $placeholder }}" @endif
        @if ($required) required @endif
        {{ $attributes->merge(['class' => 'h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary']) }} />
</x-admin.field>
