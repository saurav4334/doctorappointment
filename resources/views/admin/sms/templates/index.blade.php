@extends('layouts.admin')

@section('title', 'SMS Templates')
@section('heading', 'SMS Templates')

@section('content')
    <x-admin.page-header title="SMS Templates" subtitle="Message body for each notification event." />

    <x-admin.card padding="p-0">
        @if ($templates->isEmpty())
            <p class="px-5 py-12 text-center text-sm text-muted-foreground">No templates yet. Run the seeder to create defaults.</p>
        @else
            <div class="divide-y divide-border">
                @foreach ($templates as $template)
                    <div class="flex items-start justify-between gap-4 px-5 py-4">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <span class="font-medium text-foreground">{{ $template->title }}</span>
                                <x-admin.status-badge :status="(bool) $template->is_active" />
                            </div>
                            <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ $template->body }}</p>
                        </div>
                        <a href="{{ route('admin.sms-templates.edit', $template) }}" class="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-primary">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
                        </a>
                    </div>
                @endforeach
            </div>
        @endif
    </x-admin.card>
@endsection
