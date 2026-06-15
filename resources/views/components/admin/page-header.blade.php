@props([
    'title' => '',
    'subtitle' => null,
    'breadcrumbs' => [], // [['label' => 'Doctors', 'url' => route(...)], ['label' => 'Edit']]
])

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
        @if (!empty($breadcrumbs))
            <nav class="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <a href="{{ route('admin.dashboard') }}" class="hover:text-primary">Admin</a>
                @foreach ($breadcrumbs as $crumb)
                    <span>/</span>
                    @if (!empty($crumb['url']))
                        <a href="{{ $crumb['url'] }}" class="hover:text-primary">{{ $crumb['label'] }}</a>
                    @else
                        <span class="text-foreground">{{ $crumb['label'] }}</span>
                    @endif
                @endforeach
            </nav>
        @endif
        <h2 class="font-display text-2xl font-bold text-foreground">{{ $title }}</h2>
        @if ($subtitle)
            <p class="text-sm text-muted-foreground">{{ $subtitle }}</p>
        @endif
    </div>
    @if (isset($action))
        <div class="shrink-0">{{ $action }}</div>
    @endif
</div>
