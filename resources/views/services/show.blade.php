@extends('layouts.public')

@php
    use Illuminate\Support\Str;
    use Illuminate\Support\Facades\Storage;

    $image = $service->image
        ? (Str::startsWith($service->image, ['http://', 'https://']) ? $service->image : Storage::disk('public')->url($service->image))
        : null;
    $benefits = collect(preg_split('/\r?\n/', (string) $service->benefits))->map(fn ($b) => trim($b))->filter();
@endphp

@section('title', $service->title.' — Healthcare Services')
@section('meta_description', Str::limit(strip_tags($service->description ?: $service->title), 155))

@section('content')
    <div class="border-b bg-muted/30 py-3">
        <div class="container mx-auto px-4">
            <nav class="flex items-center gap-2 text-sm text-muted-foreground">
                <a href="{{ url('/') }}" class="hover:text-primary">Home</a>
                <span>/</span>
                <a href="{{ route('services.index') }}" class="hover:text-primary">Services</a>
                <span>/</span>
                <span class="text-foreground">{{ $service->title }}</span>
            </nav>
        </div>
    </div>

    <div class="container mx-auto grid gap-8 px-4 py-8 md:py-12 lg:grid-cols-3">
        {{-- Main --}}
        <div class="lg:col-span-2">
            @if ($image)
                <div class="aspect-[16/7] overflow-hidden rounded-xl border border-border bg-muted">
                    <img src="{{ $image }}" alt="{{ $service->title }}" class="h-full w-full object-cover">
                </div>
            @endif

            <h1 class="mt-6 font-display text-2xl font-bold text-foreground md:text-3xl">
                <span class="mr-1">{{ $service->icon }}</span>{{ $service->title }}
            </h1>

            @if ($service->description)
                <p class="mt-4 leading-relaxed text-muted-foreground">{{ $service->description }}</p>
            @endif

            @if ($benefits->isNotEmpty())
                <div class="mt-6 rounded-xl border border-border bg-card p-6">
                    <h2 class="font-display text-lg font-semibold text-foreground">Benefits</h2>
                    <ul class="mt-4 space-y-2">
                        @foreach ($benefits as $benefit)
                            <li class="flex items-start gap-3 text-muted-foreground">
                                <svg class="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                                {{ $benefit }}
                            </li>
                        @endforeach
                    </ul>
                </div>
            @endif

            @if ($service->contact_phone)
                <p class="mt-6 text-sm text-muted-foreground">
                    Prefer to call? <a href="tel:{{ preg_replace('/\s+/', '', $service->contact_phone) }}" class="font-semibold text-primary hover:underline">{{ $service->contact_phone }}</a>
                </p>
            @endif
        </div>

        {{-- Booking form --}}
        <div class="lg:col-span-1">
            <div class="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 class="font-display text-base font-semibold text-foreground">Request This Service</h3>

                @if (session('service_success'))
                    <div class="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-800">
                        {{ session('service_success') }}
                    </div>
                @endif

                <form method="POST" action="{{ route('services.request', $service->slug) }}" class="mt-4 space-y-3">
                    @csrf
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Full name</label>
                        <input type="text" name="patient_name" value="{{ old('patient_name') }}" required class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        @error('patient_name')<p class="mt-1 text-xs text-destructive">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Phone</label>
                        <input type="tel" name="phone" value="{{ old('phone') }}" required class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        @error('phone')<p class="mt-1 text-xs text-destructive">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Address</label>
                        <input type="text" name="address" value="{{ old('address') }}" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Preferred date</label>
                        <input type="date" name="preferred_date" value="{{ old('preferred_date') }}" min="{{ now()->toDateString() }}" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        @error('preferred_date')<p class="mt-1 text-xs text-destructive">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Notes</label>
                        <textarea name="notes" rows="2" class="w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">{{ old('notes') }}</textarea>
                    </div>
                    <button type="submit" class="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90">
                        Request Service
                    </button>
                </form>
            </div>
        </div>
    </div>
@endsection
