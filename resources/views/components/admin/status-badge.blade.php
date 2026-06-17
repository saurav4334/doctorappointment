@props(['status' => false, 'labels' => ['Active', 'Inactive']])

@php
    // Accepts a boolean (active/inactive) or a string status.
    if (is_bool($status)) {
        $text = $status ? $labels[0] : $labels[1];
        $class = $status ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground';
    } else {
        $map = [
            'pending'    => 'bg-amber-100 text-amber-700',
            'confirmed'  => 'bg-blue-100 text-blue-700',
            'completed'  => 'bg-green-100 text-green-700',
            'cancelled'  => 'bg-red-100 text-red-700',
            'dispatched' => 'bg-blue-100 text-blue-700',
            'paid'       => 'bg-green-100 text-green-700',
            'unpaid'     => 'bg-muted text-muted-foreground',
            'refunded'   => 'bg-amber-100 text-amber-700',
            'sent'       => 'bg-green-100 text-green-700',
            'failed'     => 'bg-red-100 text-red-700',
            'skipped'    => 'bg-muted text-muted-foreground',
            'contacted'  => 'bg-blue-100 text-blue-700',
        ];
        $text = ucfirst((string) $status);
        $class = $map[$status] ?? 'bg-muted text-muted-foreground';
    }
@endphp

<span {{ $attributes->merge(['class' => 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium '.$class]) }}>{{ $text }}</span>
