@props([
    'departments' => collect(),
    'cities' => collect(),
])

@php
    $fieldClass = 'h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary';
@endphp

<div x-data="{
        mode: 'doctor',
        city: '',
        area: '',
        specialty: '',
        go() {
            const p = new URLSearchParams();
            if (this.mode === 'doctor') {
                if (this.specialty) p.set('department', this.specialty);
                if (this.city) p.set('city', this.city);
                if (this.area) p.set('area', this.area);
                window.location.href = @js(route('doctors.index')) + (p.toString() ? ('?' + p.toString()) : '');
            } else if (this.mode === 'hospital') {
                if (this.city) p.set('city', this.city);
                if (this.area) p.set('area', this.area);
                window.location.href = @js(route('hospitals.index')) + (p.toString() ? ('?' + p.toString()) : '');
            } else {
                window.location.href = @js(route('ambulance'));
            }
        }
     }"
     {{ $attributes->merge(['class' => 'w-full rounded-2xl border border-border bg-white p-5 shadow-xl']) }}>

    <h3 class="font-display text-lg font-bold text-foreground">Get Appointment</h3>

    {{-- Mode tabs --}}
    <div class="mt-4 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 text-sm">
        @foreach (['doctor' => 'Doctor', 'hospital' => 'Hospital', 'ambulance' => 'Ambulance'] as $val => $label)
            <button type="button" @click="mode = '{{ $val }}'"
                    :class="mode === '{{ $val }}' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                    class="rounded-md py-1.5 font-medium transition-colors">{{ $label }}</button>
        @endforeach
    </div>

    {{-- Fields --}}
    <div class="mt-4 space-y-3">
        <div x-show="mode !== 'ambulance'" class="space-y-3">
            <select class="{{ $fieldClass }}">
                <option value="bangladesh">Bangladesh</option>
            </select>

            <select x-model="city" class="{{ $fieldClass }}">
                <option value="">All Cities</option>
                @foreach ($cities as $city)
                    <option value="{{ $city }}">{{ $city }}</option>
                @endforeach
            </select>

            <input type="text" x-model="area" placeholder="Area (optional)" class="{{ $fieldClass }}">

            <select x-show="mode === 'doctor'" x-model="specialty" class="{{ $fieldClass }}">
                <option value="">All Specialties</option>
                @foreach ($departments as $department)
                    <option value="{{ $department->slug }}">{{ $department->name }}</option>
                @endforeach
            </select>
        </div>

        <p x-show="mode === 'ambulance'" x-cloak class="rounded-lg bg-muted/60 px-3 py-3 text-sm text-muted-foreground">
            Need an ambulance? Tap <span class="font-medium text-foreground">Search</span> to request emergency transport.
        </p>
    </div>

    <button type="button" @click="go()"
            class="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
        Search
    </button>
</div>
