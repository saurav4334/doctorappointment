@php $isEdit = $heroSlide->exists; @endphp

<form method="POST" action="{{ $isEdit ? route('admin.hero-slides.update', $heroSlide) : route('admin.hero-slides.store') }}" enctype="multipart/form-data">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
            <x-admin.card>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="title" label="Title" :value="$heroSlide->title" required placeholder="e.g. Healthcare Anytime, Anywhere" class="sm:col-span-2" />
                    <x-admin.textarea name="subtitle" label="Subtitle" :value="$heroSlide->subtitle" rows="2" class="sm:col-span-2" />
                    <x-admin.input name="button_text" label="Button Text" :value="$heroSlide->button_text" placeholder="Find a Doctor" />
                    <x-admin.input name="button_url" label="Button URL" :value="$heroSlide->button_url" placeholder="/doctors" />
                    <x-admin.input name="sort_order" label="Sort Order" type="number" :value="$heroSlide->sort_order ?? 0" />
                </div>
            </x-admin.card>
        </div>
        <div class="space-y-6">
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Slide Image @if (!$isEdit)<span class="text-destructive">*</span>@endif</h3>
                <x-admin.image-upload name="image" label="" :value="$heroSlide->image" hint="Wide banner image (≈1920×1080)." />
            </x-admin.card>
            <x-admin.card>
                <x-admin.toggle name="is_active" label="Active" :checked="(bool) ($heroSlide->is_active ?? true)" hint="Show in homepage slider" />
            </x-admin.card>
            <div class="flex gap-3">
                <button type="submit" class="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{{ $isEdit ? 'Update' : 'Create' }}</button>
                <a href="{{ route('admin.hero-slides.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
            </div>
        </div>
    </div>
</form>
