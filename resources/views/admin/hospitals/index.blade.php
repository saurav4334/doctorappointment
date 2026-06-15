@extends('layouts.admin')

@section('title', 'Hospitals')
@section('heading', 'Hospitals')

@section('content')
    <x-admin.page-header title="Hospitals" subtitle="Partner hospitals and chambers.">
        <x-slot:action>
            <a href="{{ route('admin.hospitals.create') }}" class="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                Add Hospital
            </a>
        </x-slot:action>
    </x-admin.page-header>

    <x-admin.card padding="p-0">
        <div class="p-5 pb-0">
            <x-admin.filter-bar :action="route('admin.hospitals.index')" :search="$search" placeholder="Search by name or city..."
                :statuses="['' => 'All Status', '1' => 'Active', '0' => 'Inactive']" :status="$status" />
        </div>

        @if ($hospitals->isEmpty())
            <p class="px-5 py-12 text-center text-sm text-muted-foreground">No hospitals found.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th class="px-5 py-3 font-medium">Hospital</th>
                            <th class="px-5 py-3 font-medium">City</th>
                            <th class="px-5 py-3 font-medium">Contact</th>
                            <th class="px-5 py-3 font-medium">Doctors</th>
                            <th class="px-5 py-3 font-medium">Status</th>
                            <th class="px-5 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        @foreach ($hospitals as $hospital)
                            @php
                                $img = $hospital->image ? (\Illuminate\Support\Str::startsWith($hospital->image, ['http://','https://']) ? $hospital->image : \Illuminate\Support\Facades\Storage::url($hospital->image)) : null;
                            @endphp
                            <tr class="hover:bg-muted/30">
                                <td class="px-5 py-3">
                                    <div class="flex items-center gap-3">
                                        <span class="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                                            @if ($img)<img src="{{ $img }}" alt="" class="h-full w-full object-cover">@endif
                                        </span>
                                        <span class="font-medium text-foreground">{{ $hospital->name }}</span>
                                    </div>
                                </td>
                                <td class="px-5 py-3 text-muted-foreground">{{ $hospital->city ?? '—' }}</td>
                                <td class="px-5 py-3 text-muted-foreground">{{ $hospital->contact_number ?? '—' }}</td>
                                <td class="px-5 py-3 text-muted-foreground">{{ $hospital->doctors_count }}</td>
                                <td class="px-5 py-3"><x-admin.status-badge :status="(bool) $hospital->is_active" /></td>
                                <td class="px-5 py-3">
                                    <div class="flex items-center justify-end gap-2">
                                        <a href="{{ route('admin.hospitals.edit', $hospital) }}" class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-primary">
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
                                        </a>
                                        <form method="POST" action="{{ route('admin.hospitals.destroy', $hospital) }}" onsubmit="return confirm('Delete this hospital?')">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive">
                                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165"/></svg>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="border-t border-border p-4">{{ $hospitals->links() }}</div>
        @endif
    </x-admin.card>
@endsection
