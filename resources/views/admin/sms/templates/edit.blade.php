@extends('layouts.admin')

@section('title', 'Edit SMS Template')
@section('heading', 'Edit SMS Template')

@section('content')
    <x-admin.page-header :title="$template->title"
        :breadcrumbs="[['label' => 'SMS Templates', 'url' => route('admin.sms-templates.index')], ['label' => 'Edit']]" />

    <form method="POST" action="{{ route('admin.sms-templates.update', $template) }}">
        @csrf @method('PUT')
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="lg:col-span-2">
                <x-admin.card>
                    <x-admin.input name="title" label="Title" :value="$template->title" required />
                    <div class="mt-4">
                        <x-admin.field name="body" label="Message Body" hint="Max 1000 characters.">
                            <textarea name="body" id="sms-body" rows="5"
                                      class="w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">{{ old('body', $template->body) }}</textarea>
                        </x-admin.field>
                    </div>
                    <div class="mt-4">
                        <x-admin.toggle name="is_active" label="Active" :checked="(bool) $template->is_active" />
                    </div>
                    <div class="mt-5 flex gap-3">
                        <button type="submit" class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save Template</button>
                        <a href="{{ route('admin.sms-templates.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
                    </div>
                </x-admin.card>
            </div>

            {{-- Placeholder palette --}}
            <div>
                <x-admin.card>
                    <h3 class="font-display text-sm font-semibold text-foreground">Available Placeholders</h3>
                    <p class="mt-1 text-xs text-muted-foreground">Click to insert at the cursor.</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                        @foreach ($placeholders as $ph)
                            <button type="button" onclick="insertPlaceholder('{{ '{'.$ph.'}' }}')"
                                    class="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs text-primary hover:bg-primary/10">{{ '{'.$ph.'}' }}</button>
                        @endforeach
                    </div>
                </x-admin.card>
            </div>
        </div>
    </form>

    @push('scripts')
    <script>
        function insertPlaceholder(token) {
            const ta = document.getElementById('sms-body');
            if (!ta) return;
            const start = ta.selectionStart ?? ta.value.length;
            const end = ta.selectionEnd ?? ta.value.length;
            ta.value = ta.value.slice(0, start) + token + ta.value.slice(end);
            ta.focus();
            ta.selectionStart = ta.selectionEnd = start + token.length;
        }
    </script>
    @endpush
@endsection
