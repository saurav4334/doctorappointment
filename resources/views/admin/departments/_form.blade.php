@php $isEdit = $department->exists; @endphp

<form method="POST" action="{{ $isEdit ? route('admin.departments.update', $department) : route('admin.departments.store') }}">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
            <x-admin.card>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="name" label="Name" :value="$department->name" required placeholder="e.g. Cardiology" class="sm:col-span-2" />
                    <x-admin.input name="icon" label="Icon (emoji)" :value="$department->icon" placeholder="❤️" hint="Optional emoji or symbol" />
                    <x-admin.input name="sort_order" label="Sort Order" type="number" :value="$department->sort_order ?? 0" />
                    <x-admin.textarea name="description" label="Description" :value="$department->description" class="sm:col-span-2" />
                </div>
            </x-admin.card>
        </div>
        <div class="space-y-6">
            <x-admin.card>
                <x-admin.toggle name="is_active" label="Active" :checked="(bool) ($department->is_active ?? true)" hint="Visible on the website" />
            </x-admin.card>
            <div class="flex gap-3">
                <button type="submit" class="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{{ $isEdit ? 'Update' : 'Create' }}</button>
                <a href="{{ route('admin.departments.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
            </div>
        </div>
    </div>
</form>
