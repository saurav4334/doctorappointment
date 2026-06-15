@php
    $isEdit = $doctor->exists;
    $specsValue = old('specializations') !== null
        ? (is_array(old('specializations')) ? implode(', ', old('specializations')) : old('specializations'))
        : implode(', ', $doctor->specializations ?? []);
    $qualsValue = old('qualifications') !== null
        ? (is_array(old('qualifications')) ? implode(', ', old('qualifications')) : old('qualifications'))
        : implode(', ', $doctor->qualifications ?? []);
@endphp

<form method="POST"
      action="{{ $isEdit ? route('admin.doctors.update', $doctor) : route('admin.doctors.store') }}"
      enctype="multipart/form-data"
      onsubmit="document.getElementById('bio') && (document.getElementById('bio').value = window.__bioEditor ? window.__bioEditor.root.innerHTML : document.getElementById('bio').value)">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {{-- Main column --}}
        <div class="space-y-6 lg:col-span-2">
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Basic Information</h3>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.field name="title" label="Title">
                        <select name="title" id="title" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            @foreach (['Dr.', 'Prof.', 'Assoc. Prof.', 'Asst. Prof.'] as $t)
                                <option value="{{ $t }}" @selected(old('title', $doctor->title ?? 'Dr.') === $t)>{{ $t }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                    <x-admin.input name="full_name" label="Full Name" :value="$doctor->full_name" required placeholder="e.g. Ayesha Rahman" />
                    <x-admin.input name="specializations" label="Specializations" :value="$specsValue" placeholder="Cardiology, Internal Medicine" hint="Comma-separated" />
                    <x-admin.input name="qualifications" label="Qualifications" :value="$qualsValue" placeholder="MBBS, FCPS, MD" hint="Comma-separated" />
                    <x-admin.field name="gender" label="Gender">
                        <select name="gender" id="gender" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            <option value="">Select…</option>
                            @foreach (['male' => 'Male', 'female' => 'Female', 'other' => 'Other'] as $val => $label)
                                <option value="{{ $val }}" @selected(old('gender', $doctor->gender) === $val)>{{ $label }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                    <x-admin.input name="experience_years" label="Experience (years)" type="number" :value="$doctor->experience_years ?? 0" />
                </div>
            </x-admin.card>

            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Affiliation & Fee</h3>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="hospital_name" label="Hospital / Chamber Name" :value="$doctor->hospital_name" placeholder="e.g. Square Hospital, Dhaka" hint="Max 150 characters" class="sm:col-span-2" />
                    <x-admin.field name="hospital_id" label="Linked Hospital (optional)">
                        <select name="hospital_id" id="hospital_id" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            <option value="">None</option>
                            @foreach ($hospitals as $h)
                                <option value="{{ $h->id }}" @selected((int) old('hospital_id', $doctor->hospital_id) === $h->id)>{{ $h->name }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                    <x-admin.field name="department_id" label="Department">
                        <select name="department_id" id="department_id" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            <option value="">None</option>
                            @foreach ($departments as $d)
                                <option value="{{ $d->id }}" @selected((int) old('department_id', $doctor->department_id) === $d->id)>{{ $d->name }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                    <x-admin.input name="consultation_fee" label="Consultation Fee (৳)" type="number" :value="(int) ($doctor->consultation_fee ?? 0)" />
                    <x-admin.input name="rating" label="Rating (0–5)" type="number" step="0.1" :value="$doctor->rating ?? 0" />
                </div>
            </x-admin.card>

            <x-admin.card>
                <h3 class="mb-2 font-display text-base font-semibold text-foreground">Bio</h3>
                {{-- Rich text: Quill enhances #bio-editor and syncs to the hidden #bio textarea on submit --}}
                <div id="bio-editor" class="rounded-lg border border-border bg-background">{!! old('bio', $doctor->bio) !!}</div>
                <textarea id="bio" name="bio" class="hidden">{{ old('bio', $doctor->bio) }}</textarea>
                @error('bio')<p class="mt-1 text-xs text-destructive">{{ $message }}</p>@enderror
            </x-admin.card>
        </div>

        {{-- Side column --}}
        <div class="space-y-6">
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Photo</h3>
                <x-admin.image-upload name="photo" label="" :value="$doctor->photo" />
            </x-admin.card>

            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Visibility</h3>
                <div class="space-y-4" x-data="{ featured: @js((bool) old('is_featured', $doctor->is_featured ?? false)) }">
                    <div @click="featured = !featured">
                        <x-admin.toggle name="is_featured" label="Featured Doctor" :checked="(bool) ($doctor->is_featured ?? false)" hint="Show in Top Rated section" />
                    </div>
                    <div x-show="featured" x-cloak>
                        <x-admin.input name="featured_priority" label="Featured Priority" type="number" :value="$doctor->featured_priority ?? 0" hint="Higher shows first" />
                    </div>
                    <div class="border-t border-border pt-4">
                        <x-admin.toggle name="is_active" label="Active" :checked="(bool) ($doctor->is_active ?? true)" hint="Visible on the website" />
                    </div>
                </div>
            </x-admin.card>

            <div class="flex gap-3">
                <button type="submit" class="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    {{ $isEdit ? 'Update Doctor' : 'Create Doctor' }}
                </button>
                <a href="{{ route('admin.doctors.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
            </div>
        </div>
    </div>
</form>

@push('head')
    <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet">
@endpush
@push('scripts')
    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"></script>
    <script>
        // Progressive enhancement: if Quill loads, use it; otherwise the textarea still works.
        document.addEventListener('DOMContentLoaded', function () {
            if (window.Quill && document.getElementById('bio-editor')) {
                window.__bioEditor = new Quill('#bio-editor', {
                    theme: 'snow',
                    placeholder: 'Write a short professional bio…',
                    modules: { toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link'], ['clean']] },
                });
            } else if (document.getElementById('bio-editor')) {
                // Fallback: replace the styled div with the visible textarea.
                document.getElementById('bio-editor').style.display = 'none';
                document.getElementById('bio').classList.remove('hidden');
                document.getElementById('bio').classList.add('w-full', 'rounded-lg', 'border-border', 'p-3', 'text-sm');
                document.getElementById('bio').rows = 5;
            }
        });
    </script>
@endpush
