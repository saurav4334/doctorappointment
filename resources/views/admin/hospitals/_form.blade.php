@php $isEdit = $hospital->exists; @endphp

<form method="POST" action="{{ $isEdit ? route('admin.hospitals.update', $hospital) : route('admin.hospitals.store') }}" enctype="multipart/form-data">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
            <x-admin.card>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="name" label="Name" :value="$hospital->name" required placeholder="e.g. Square Hospital" class="sm:col-span-2" />
                    <x-admin.input name="city" label="City" :value="$hospital->city" placeholder="Dhaka" />
                    <x-admin.input name="contact_number" label="Contact Number" :value="$hospital->contact_number" placeholder="+880 ..." />
                    <x-admin.input name="address" label="Address" :value="$hospital->address" class="sm:col-span-2" />
                    <x-admin.textarea name="description" label="Description" :value="$hospital->description" class="sm:col-span-2" />
                </div>
            </x-admin.card>
        </div>
        <div class="space-y-6">
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Image</h3>
                <x-admin.image-upload name="image" label="" :value="$hospital->image" />
            </x-admin.card>
            <x-admin.card>
                <x-admin.toggle name="is_active" label="Active" :checked="(bool) ($hospital->is_active ?? true)" hint="Visible on the website" />
            </x-admin.card>
            <div class="flex gap-3">
                <button type="submit" class="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{{ $isEdit ? 'Update' : 'Create' }}</button>
                <a href="{{ route('admin.hospitals.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
            </div>
        </div>
    </div>
</form>
