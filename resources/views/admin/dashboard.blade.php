@extends('layouts.admin')

@section('title', 'Dashboard')
@section('heading', 'Dashboard')

@section('content')
    <x-admin.page-header title="Welcome back, {{ auth()->user()->name }}" subtitle="Here's what's happening across your platform." />

    @php
        $cards = [
            ['label' => 'Total Doctors', 'value' => $stats['doctors'], 'url' => route('admin.doctors.index'), 'color' => 'text-blue-600 bg-blue-100'],
            ['label' => 'Total Hospitals', 'value' => $stats['hospitals'], 'url' => route('admin.hospitals.index'), 'color' => 'text-emerald-600 bg-emerald-100'],
            ['label' => 'Total Appointments', 'value' => $stats['appointments'], 'url' => route('admin.appointments.index'), 'color' => 'text-violet-600 bg-violet-100'],
            ['label' => 'Pending Appointments', 'value' => $stats['pending'], 'url' => route('admin.appointments.index', ['status' => 'pending']), 'color' => 'text-amber-600 bg-amber-100'],
            ['label' => 'Featured Doctors', 'value' => $stats['featured'], 'url' => route('admin.doctors.index'), 'color' => 'text-rose-600 bg-rose-100'],
        ];
    @endphp

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        @foreach ($cards as $card)
            <a href="{{ $card['url'] }}" class="group">
                <x-admin.card class="transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                    <div class="flex items-center justify-between">
                        <span class="flex h-10 w-10 items-center justify-center rounded-lg {{ $card['color'] }}">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>
                        </span>
                    </div>
                    <p class="mt-4 text-3xl font-bold text-foreground">{{ number_format($card['value']) }}</p>
                    <p class="text-sm text-muted-foreground">{{ $card['label'] }}</p>
                </x-admin.card>
            </a>
        @endforeach
    </div>

    <div class="mt-6">
        <x-admin.card padding="p-0">
            <div class="flex items-center justify-between border-b border-border px-5 py-4">
                <h3 class="font-display text-lg font-semibold text-foreground">Recent Appointments</h3>
                <a href="{{ route('admin.appointments.index') }}" class="text-sm font-medium text-primary hover:underline">View all</a>
            </div>
            @if ($recentAppointments->isEmpty())
                <p class="px-5 py-10 text-center text-sm text-muted-foreground">No appointments yet.</p>
            @else
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th class="px-5 py-3 font-medium">Patient</th>
                                <th class="px-5 py-3 font-medium">Doctor</th>
                                <th class="px-5 py-3 font-medium">Date</th>
                                <th class="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            @foreach ($recentAppointments as $a)
                                <tr class="hover:bg-muted/30">
                                    <td class="px-5 py-3 font-medium text-foreground">{{ $a->patient_name }}</td>
                                    <td class="px-5 py-3 text-muted-foreground">{{ $a->doctor?->full_name ?? '—' }}</td>
                                    <td class="px-5 py-3 text-muted-foreground">{{ $a->appointment_date?->format('d M Y') }} · {{ \Illuminate\Support\Str::substr($a->appointment_time, 0, 5) }}</td>
                                    <td class="px-5 py-3"><x-admin.status-badge :status="$a->status" /></td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </x-admin.card>
    </div>
@endsection
