@props([
    'name' => 'image',
    'label' => 'Image',
    'value' => null,       // existing stored path or URL
    'hint' => 'PNG, JPG or WEBP up to 5MB.',
])

@php
    $existing = null;
    if ($value) {
        $existing = \Illuminate\Support\Str::startsWith($value, ['http://', 'https://'])
            ? $value
            : \Illuminate\Support\Facades\Storage::disk('public')->url($value);
    }
@endphp

<div x-data="{ preview: @js($existing) }">
    <label class="mb-1.5 block text-sm font-medium text-foreground">{{ $label }}</label>
    <div class="flex items-center gap-4">
        {{-- Preview --}}
        <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
            <template x-if="preview">
                <img :src="preview" alt="Preview" class="h-full w-full object-cover">
            </template>
            <template x-if="!preview">
                <svg class="h-7 w-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.18 0l5.16 5.16m-1.5-1.5 1.41-1.41a2.25 2.25 0 0 1 3.18 0l2.16 2.16M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"/></svg>
            </template>
        </div>

        <div class="flex-1">
            <input type="file" name="{{ $name }}" accept="image/*"
                   @change="const f=$event.target.files[0]; if(f){preview=URL.createObjectURL(f)}"
                   class="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90" />
            <p class="mt-1.5 text-xs text-muted-foreground">{{ $hint }}</p>
            @error($name)
                <p class="mt-1 text-xs text-destructive">{{ $message }}</p>
            @enderror
        </div>
    </div>
</div>
