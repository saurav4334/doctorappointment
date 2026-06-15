@extends('layouts.admin')

@section('title', 'Appointments')
@section('heading', 'Appointments')

@section('content')
    <x-admin.page-header title="Appointments" subtitle="Manage and track patient appointments.">
        <x-slot:action>
            <a href="{{ route('admin.appointments.create') }}" class="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                New Appointment
            </a>
        </x-slot:action>
    </x-admin.page-header>

    <x-admin.card padding="p-0">
        <div class="p-5 pb-0">
            <x-admin.filter-bar :action="route('admin.appointments.index')" :search="$search" placeholder="Search by patient name or phone..."
                :statuses="$statusOptions" :status="$status" />
        </div>

        @if ($appointments->isEmpty())
            <p class="px-5 py-12 text-center text-sm text-muted-foreground">No appointments found.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th class="px-5 py-3 font-medium">Patient</th>
                            <th class="px-5 py-3 font-medium">Doctor</th>
                            <th class="px-5 py-3 font-medium">Date / Time</th>
                            <th class="px-5 py-3 font-medium">Payment</th>
                            <th class="px-5 py-3 font-medium">Status</th>
                            <th class="px-5 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        @foreach ($appointments as $a)
                            <tr class="hover:bg-muted/30">
                                <td class="px-5 py-3">
                                    <p class="font-medium text-foreground">{{ $a->patient_name }}</p>
                                    <p class="text-xs text-muted-foreground">{{ $a->patient_phone }}</p>
                                </td>
                                <td class="px-5 py-3 text-muted-foreground">{{ $a->doctor?->full_name ?? '—' }}</td>
                                <td class="px-5 py-3 text-muted-foreground">{{ $a->appointment_date?->format('d M Y') }} · {{ \Illuminate\Support\Str::substr($a->appointment_time, 0, 5) }}</td>
                                <td class="px-5 py-3"><x-admin.status-badge :status="$a->payment_status" /></td>
                                <td class="px-5 py-3"><x-admin.status-badge :status="$a->status" /></td>
                                <td class="px-5 py-3">
                                    <div class="flex items-center justify-end gap-2">
                                        <a href="{{ route('admin.appointments.edit', $a) }}" class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-primary">
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
                                        </a>
                                        <form method="POST" action="{{ route('admin.appointments.destroy', $a) }}" onsubmit="return confirm('Delete this appointment?')">
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
            <div class="border-t border-border p-4">{{ $appointments->links() }}</div>
        @endif
    </x-admin.card>
@endsection
