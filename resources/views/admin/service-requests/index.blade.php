@extends('layouts.admin')

@section('title', 'Service Requests')
@section('heading', 'Service Requests')

@section('content')
    <x-admin.page-header title="Service Requests" subtitle="Home healthcare service bookings submitted by patients." />

    <x-admin.card padding="p-0">
        <div class="p-5 pb-0">
            <x-admin.filter-bar :action="route('admin.service-requests.index')" :search="$search" placeholder="Search by name or phone..."
                :statuses="$statusOptions" :status="$status" />
        </div>

        @if ($requests->isEmpty())
            <p class="px-5 py-12 text-center text-sm text-muted-foreground">No service requests yet.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th class="px-5 py-3 font-medium">Patient</th>
                            <th class="px-5 py-3 font-medium">Service</th>
                            <th class="px-5 py-3 font-medium">Preferred Date</th>
                            <th class="px-5 py-3 font-medium">Status</th>
                            <th class="px-5 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        @foreach ($requests as $req)
                            <tr class="hover:bg-muted/30">
                                <td class="px-5 py-3">
                                    <p class="font-medium text-foreground">{{ $req->patient_name }}</p>
                                    <p class="text-xs text-muted-foreground">{{ $req->phone }}</p>
                                </td>
                                <td class="px-5 py-3 text-muted-foreground">{{ $req->service?->title ?? '—' }}</td>
                                <td class="px-5 py-3 text-muted-foreground">{{ $req->preferred_date?->format('d M Y') ?? '—' }}</td>
                                <td class="px-5 py-3"><x-admin.status-badge :status="$req->status" /></td>
                                <td class="px-5 py-3">
                                    <div class="flex items-center justify-end gap-2">
                                        <form method="POST" action="{{ route('admin.service-requests.set-status', $req) }}">
                                            @csrf @method('PATCH')
                                            <select name="status" onchange="this.form.submit()" class="h-8 rounded-md border-border bg-background text-xs focus:border-primary focus:ring-primary">
                                                @foreach (['pending' => 'Pending', 'contacted' => 'Contacted', 'completed' => 'Completed', 'cancelled' => 'Cancelled'] as $val => $label)
                                                    <option value="{{ $val }}" @selected($req->status === $val)>{{ $label }}</option>
                                                @endforeach
                                            </select>
                                        </form>
                                        <form method="POST" action="{{ route('admin.service-requests.destroy', $req) }}" onsubmit="return confirm('Delete this request?')">
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
            <div class="border-t border-border p-4">{{ $requests->links() }}</div>
        @endif
    </x-admin.card>
@endsection
