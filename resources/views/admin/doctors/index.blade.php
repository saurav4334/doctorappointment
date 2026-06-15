@extends('layouts.admin')

@section('title', 'Doctors')
@section('heading', 'Doctors')

@section('content')
    <x-admin.page-header title="Doctors" subtitle="Manage doctor profiles, featured status and schedules.">
        <x-slot:action>
            <a href="{{ route('admin.doctors.create') }}" class="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                Add Doctor
            </a>
        </x-slot:action>
    </x-admin.page-header>

    <x-admin.card padding="p-0">
        <div class="p-5 pb-0">
            <x-admin.filter-bar :action="route('admin.doctors.index')" :search="$search" placeholder="Search by name or specialty..."
                :statuses="['' => 'All Status', '1' => 'Active', '0' => 'Inactive']" :status="$status" />
        </div>

        @if ($doctors->isEmpty())
            <p class="px-5 py-12 text-center text-sm text-muted-foreground">No doctors found.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th class="px-5 py-3 font-medium">Doctor</th>
                            <th class="px-5 py-3 font-medium">Hospital</th>
                            <th class="px-5 py-3 font-medium">Fee</th>
                            <th class="px-5 py-3 font-medium">Rating</th>
                            <th class="px-5 py-3 font-medium">Featured</th>
                            <th class="px-5 py-3 font-medium">Status</th>
                            <th class="px-5 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        @foreach ($doctors as $doctor)
                            @php
                                $photo = $doctor->photo ? (\Illuminate\Support\Str::startsWith($doctor->photo, ['http://','https://']) ? $doctor->photo : \Illuminate\Support\Facades\Storage::url($doctor->photo)) : null;
                            @endphp
                            <tr class="hover:bg-muted/30">
                                <td class="px-5 py-3">
                                    <div class="flex items-center gap-3">
                                        <span class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                                            @if ($photo)<img src="{{ $photo }}" alt="" class="h-full w-full object-cover">@endif
                                        </span>
                                        <div>
                                            <p class="font-medium text-foreground">{{ $doctor->full_name }}</p>
                                            <p class="text-xs text-muted-foreground">{{ $doctor->specializations[0] ?? '—' }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-5 py-3 text-muted-foreground">{{ $doctor->hospital_label ?? '—' }}</td>
                                <td class="px-5 py-3 text-muted-foreground">৳{{ (int) $doctor->consultation_fee }}</td>
                                <td class="px-5 py-3 text-muted-foreground">{{ $doctor->rating }} ★</td>
                                <td class="px-5 py-3">
                                    @if ($doctor->is_featured)
                                        <span class="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">★ {{ $doctor->featured_priority }}</span>
                                    @else
                                        <span class="text-xs text-muted-foreground">—</span>
                                    @endif
                                </td>
                                <td class="px-5 py-3"><x-admin.status-badge :status="(bool) $doctor->is_active" /></td>
                                <td class="px-5 py-3">
                                    <div class="flex items-center justify-end gap-2">
                                        <a href="{{ route('admin.doctors.edit', $doctor) }}" class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-primary" title="Edit">
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
                                        </a>
                                        <form method="POST" action="{{ route('admin.doctors.destroy', $doctor) }}" onsubmit="return confirm('Delete this doctor?')">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive" title="Delete">
                                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="border-t border-border p-4">{{ $doctors->links() }}</div>
        @endif
    </x-admin.card>
@endsection
