@extends('layouts.admin')

@section('title', 'Edit Doctor')
@section('heading', 'Edit Doctor')

@php $days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']; @endphp

@section('content')
    <x-admin.page-header :title="$doctor->full_name"
        :breadcrumbs="[['label' => 'Doctors', 'url' => route('admin.doctors.index')], ['label' => 'Edit']]" />

    @include('admin.doctors._form')

    {{-- Schedule management --}}
    <div class="mt-6">
        <x-admin.card>
            <h3 class="mb-4 font-display text-base font-semibold text-foreground">Weekly Schedule</h3>

            {{-- Add slot --}}
            <form method="POST" action="{{ route('admin.doctors.schedules.store', $doctor) }}" class="grid grid-cols-1 gap-3 sm:grid-cols-5">
                @csrf
                <select name="day_of_week" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary" required>
                    @foreach ($days as $i => $day)
                        <option value="{{ $i }}">{{ $day }}</option>
                    @endforeach
                </select>
                <input type="time" name="start_time" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary" required>
                <input type="time" name="end_time" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary" required>
                <select name="hospital_id" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                    <option value="">Hospital (optional)</option>
                    @foreach ($hospitals as $h)
                        <option value="{{ $h->id }}">{{ $h->name }}</option>
                    @endforeach
                </select>
                <button type="submit" class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Add Slot</button>
            </form>

            {{-- Existing slots --}}
            <div class="mt-5">
                @forelse ($doctor->schedules as $s)
                    <div class="flex items-center justify-between border-b border-border py-3 last:border-0">
                        <div class="flex items-center gap-4 text-sm">
                            <span class="w-24 font-medium text-foreground">{{ $days[$s->day_of_week] ?? '' }}</span>
                            <span class="text-muted-foreground">{{ \Illuminate\Support\Str::substr($s->start_time, 0, 5) }} – {{ \Illuminate\Support\Str::substr($s->end_time, 0, 5) }}</span>
                            <span class="text-muted-foreground">{{ $s->hospital?->name ?? '—' }}</span>
                        </div>
                        <form method="POST" action="{{ route('admin.doctors.schedules.destroy', [$doctor, $s]) }}" onsubmit="return confirm('Remove this slot?')">
                            @csrf @method('DELETE')
                            <button type="submit" class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                            </button>
                        </form>
                    </div>
                @empty
                    <p class="py-4 text-center text-sm text-muted-foreground">No schedule slots yet.</p>
                @endforelse
            </div>
        </x-admin.card>
    </div>
@endsection
