@php $isEdit = $counter->exists; @endphp

<form method="POST" action="{{ $isEdit ? route('admin.stat-counters.update', $counter) : route('admin.stat-counters.store') }}">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
            <x-admin.card>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="title" label="Title" :value="$counter->title" required class="sm:col-span-2" placeholder="e.g. Registered Doctors" />
                    <x-admin.input name="value" label="Number" type="number" :value="$counter->value ?? 0" required />
                    <x-admin.input name="suffix" label="Suffix" :value="$counter->suffix" placeholder="+ / K / %" />
                    <x-admin.input name="icon" label="Icon (emoji)" :value="$counter->icon" placeholder="🩺" />
                    <x-admin.input name="sort_order" label="Sort Order" type="number" :value="$counter->sort_order ?? 0" />
                </div>
            </x-admin.card>
        </div>
        <div class="space-y-6">
            <x-admin.card>
                <x-admin.toggle name="is_active" label="Active" :checked="(bool) ($counter->is_active ?? true)" />
            </x-admin.card>
            <div class="flex gap-3">
                <button type="submit" class="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{{ $isEdit ? 'Update' : 'Create' }}</button>
                <a href="{{ route('admin.stat-counters.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
            </div>
        </div>
    </div>
</form>
