@props([
    'name' => '',
    'label' => '',
    'rows' => 4,
    'value' => null,
    'required' => false,
    'placeholder' => '',
    'hint' => null,
])

<x-admin.field :name="$name" :label="$label" :required="$required" :hint="$hint">
    <textarea
        name="{{ $name }}"
        id="{{ $name }}"
        rows="{{ $rows }}"
        @if ($placeholder) placeholder="{{ $placeholder }}" @endif
        @if ($required) required @endif
        {{ $attributes->merge(['class' => 'w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary']) }}>{{ old($name, $value) }}</textarea>
</x-admin.field>
