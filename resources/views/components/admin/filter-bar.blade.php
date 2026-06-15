@props([
    'action' => '',
    'search' => '',
    'placeholder' => 'Search...',
    'statuses' => null,   // ['' => 'All', '1' => 'Active', '0' => 'Inactive']
    'status' => null,
])

<form method="GET" action="{{ $action }}" class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
    <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
        <input type="text" name="q" value="{{ $search }}" placeholder="{{ $placeholder }}"
               class="h-10 w-full rounded-lg border-border bg-background pl-9 text-sm focus:border-primary focus:ring-primary" />
    </div>

    @if ($statuses)
        <select name="status" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary sm:w-44">
            @foreach ($statuses as $val => $label)
                <option value="{{ $val }}" @selected((string) $status === (string) $val)>{{ $label }}</option>
            @endforeach
        </select>
    @endif

    {{ $slot }}

    <button type="submit" class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Filter</button>
</form>
