@php $isEdit = $advertisement->exists; @endphp

<form method="POST" action="{{ $isEdit ? route('admin.advertisements.update', $advertisement) : route('admin.advertisements.store') }}" enctype="multipart/form-data">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
            <x-admin.card>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="title" label="Advertisement Title" :value="$advertisement->title" required placeholder="e.g. Annual Health Checkup Offer" class="sm:col-span-2" />
                    <x-admin.input name="sponsor_name" label="Sponsor Name" :value="$advertisement->sponsor_name" placeholder="e.g. Popular Diagnostic" />
                    <x-admin.field name="placement" label="Placement" required>
                        <select name="placement" id="placement" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            @foreach ($placements as $val => $label)
                                <option value="{{ $val }}" @selected(old('placement', $advertisement->placement) === $val)>{{ $label }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                    <x-admin.input name="redirect_url" label="Redirect URL" :value="$advertisement->redirect_url" placeholder="https://example.com or /doctors" hint="Internal path or http(s) URL" class="sm:col-span-2" />
                    <x-admin.input name="start_date" label="Start Date" type="date" :value="optional($advertisement->start_date)->format('Y-m-d')" />
                    <x-admin.input name="end_date" label="End Date" type="date" :value="optional($advertisement->end_date)->format('Y-m-d')" />
                    <x-admin.input name="sort_order" label="Sort Order" type="number" :value="$advertisement->sort_order ?? 0" />
                </div>
            </x-admin.card>
        </div>
        <div class="space-y-6">
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Banner Image @if (!$isEdit)<span class="text-destructive">*</span>@endif</h3>
                <x-admin.image-upload name="image" label="" :value="$advertisement->image" hint="Use the recommended size for the chosen placement." />
            </x-admin.card>
            <x-admin.card>
                <x-admin.toggle name="is_active" label="Active" :checked="(bool) ($advertisement->is_active ?? true)" hint="Only active ads within their date window are shown" />
            </x-admin.card>
            <div class="flex gap-3">
                <button type="submit" class="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{{ $isEdit ? 'Update' : 'Create' }}</button>
                <a href="{{ route('admin.advertisements.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
            </div>
        </div>
    </div>
</form>
