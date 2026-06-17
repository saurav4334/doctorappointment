@extends('layouts.admin')

@section('title', 'SMS Logs')
@section('heading', 'SMS Logs')

@section('content')
    <x-admin.page-header title="SMS Logs" subtitle="Every SMS attempt and its delivery status." />

    <x-admin.card padding="p-0">
        <div class="p-5 pb-0">
            <form method="GET" action="{{ route('admin.sms-logs.index') }}" class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <input type="text" name="q" value="{{ $search }}" placeholder="Search phone..." class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                <select name="status" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                    @foreach ($statusOptions as $val => $label)
                        <option value="{{ $val }}" @selected((string) $status === (string) $val)>{{ $label }}</option>
                    @endforeach
                </select>
                <select name="event" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                    @foreach ($eventOptions as $val => $label)
                        <option value="{{ $val }}" @selected((string) $event === (string) $val)>{{ $label }}</option>
                    @endforeach
                </select>
                <input type="date" name="from" value="{{ $from }}" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                <div class="flex gap-2">
                    <input type="date" name="to" value="{{ $to }}" class="h-10 flex-1 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                    <button type="submit" class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Filter</button>
                </div>
            </form>
        </div>

        @if ($logs->isEmpty())
            <p class="px-5 py-12 text-center text-sm text-muted-foreground">No SMS logs found.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th class="px-5 py-3 font-medium">Recipient</th>
                            <th class="px-5 py-3 font-medium">Event</th>
                            <th class="px-5 py-3 font-medium">Message</th>
                            <th class="px-5 py-3 font-medium">Status</th>
                            <th class="px-5 py-3 font-medium">When</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        @foreach ($logs as $log)
                            <tr class="hover:bg-muted/30 align-top">
                                <td class="px-5 py-3 font-medium text-foreground">{{ $log->recipient_number ?? '—' }}</td>
                                <td class="px-5 py-3 text-muted-foreground">{{ \Illuminate\Support\Str::headline(str_replace('_', ' ', (string) $log->event_type)) ?: '—' }}</td>
                                <td class="px-5 py-3 text-muted-foreground"><span class="line-clamp-2 max-w-xs">{{ $log->message }}</span>
                                    @if ($log->error_message)<span class="mt-1 block text-xs text-destructive">{{ $log->error_message }}</span>@endif
                                </td>
                                <td class="px-5 py-3"><x-admin.status-badge :status="$log->status" /></td>
                                <td class="px-5 py-3 text-xs text-muted-foreground">{{ $log->created_at?->format('d M Y H:i') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="border-t border-border p-4">{{ $logs->links() }}</div>
        @endif
    </x-admin.card>
@endsection
