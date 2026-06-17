@php $isEdit = $service->exists; @endphp

<form method="POST" action="{{ $isEdit ? route('admin.healthcare-services.update', $service) : route('admin.healthcare-services.store') }}" enctype="multipart/form-data">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
            <x-admin.card>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="title" label="Service Name" :value="$service->title" required class="sm:col-span-2" />
                    <x-admin.input name="icon" label="Icon (emoji)" :value="$service->icon" placeholder="🩺" />
                    <x-admin.input name="contact_phone" label="Contact Phone" :value="$service->contact_phone" />
                    <x-admin.textarea name="description" label="Description" :value="$service->description" class="sm:col-span-2" />
                    <x-admin.textarea name="benefits" label="Benefits (one per line)" :value="$service->benefits" class="sm:col-span-2" hint="Shown as a checklist on the service page." />
                </div>
            </x-admin.card>
        </div>
        <div class="space-y-6">
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Image</h3>
                <x-admin.image-upload name="image" label="" :value="$service->image" />
            </x-admin.card>
            <x-admin.card>
                <div class="space-y-4">
                    <x-admin.input name="sort_order" label="Sort Order" type="number" :value="$service->sort_order ?? 0" />
                    <x-admin.toggle name="is_active" label="Active" :checked="(bool) ($service->is_active ?? true)" />
                </div>
            </x-admin.card>
            <div class="flex gap-3">
                <button type="submit" class="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{{ $isEdit ? 'Update' : 'Create' }}</button>
                <a href="{{ route('admin.healthcare-services.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
            </div>
        </div>
    </div>
</form>
