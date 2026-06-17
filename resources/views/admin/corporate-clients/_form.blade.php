@php $isEdit = $client->exists; @endphp

<form method="POST" action="{{ $isEdit ? route('admin.corporate-clients.update', $client) : route('admin.corporate-clients.store') }}" enctype="multipart/form-data">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
            <x-admin.card>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="name" label="Client Name" :value="$client->name" required class="sm:col-span-2" />
                    <x-admin.input name="website_url" label="Website URL" :value="$client->website_url" placeholder="https://example.com" />
                    <x-admin.input name="sort_order" label="Sort Order" type="number" :value="$client->sort_order ?? 0" />
                </div>
            </x-admin.card>
        </div>
        <div class="space-y-6">
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Logo</h3>
                <x-admin.image-upload name="logo" label="" :value="$client->logo" hint="PNG/SVG with transparent background works best." />
            </x-admin.card>
            <x-admin.card>
                <x-admin.toggle name="is_active" label="Active" :checked="(bool) ($client->is_active ?? true)" />
            </x-admin.card>
            <div class="flex gap-3">
                <button type="submit" class="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{{ $isEdit ? 'Update' : 'Create' }}</button>
                <a href="{{ route('admin.corporate-clients.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
            </div>
        </div>
    </div>
</form>
