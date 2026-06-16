@extends('layouts.public')

@section('title', 'Find & Book Doctors — Doctors AppointmentBD')
@section('meta_description', 'Search and book from our network of experienced specialist doctors across multiple hospitals.')

@section('content')
    {{-- Search hero --}}
    <section class="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 md:py-16">
        <div class="container mx-auto px-4">
            <div class="mx-auto max-w-3xl text-center">
                <h1 class="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">Find &amp; Book Your Doctor</h1>
                <p class="mt-4 text-lg text-muted-foreground">Search from our network of experienced doctors across multiple hospitals</p>
            </div>

            <form method="GET" action="{{ route('doctors.index') }}" class="mx-auto mt-8 max-w-4xl">
                <div class="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-lg md:flex-row md:items-center">
                    <div class="relative flex-1">
                        <svg class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
                        <input type="text" name="q" value="{{ $search }}" placeholder="Search by doctor name or specialty..."
                               class="h-11 w-full rounded-lg border-border bg-background pl-10 text-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <select name="department" class="h-11 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary md:w-[200px]">
                        <option value="">All Departments</option>
                        @foreach ($departments as $dept)
                            <option value="{{ $dept->slug }}" @selected($departmentSlug === $dept->slug)>{{ $dept->name }}</option>
                        @endforeach
                    </select>
                    <select name="sort" class="h-11 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary md:w-[180px]">
                        <option value="rating" @selected($sort === 'rating')>Highest Rated</option>
                        <option value="experience" @selected($sort === 'experience')>Most Experienced</option>
                        <option value="fee-low" @selected($sort === 'fee-low')>Fee: Low to High</option>
                        <option value="fee-high" @selected($sort === 'fee-high')>Fee: High to Low</option>
                    </select>
                    <x-btn variant="hero" type="submit" class="w-full md:w-auto">Search</x-btn>
                </div>
            </form>
        </div>
    </section>

    {{-- Results + sidebar advertisements --}}
    <section class="py-12 md:py-16">
        <div class="container mx-auto px-4">
            @php
                $adLeft = \App\Models\Advertisement::liveFor('doctor_listing_left');
                $adRight = \App\Models\Advertisement::liveFor('doctor_listing_right');
            @endphp

            <div class="lg:flex lg:items-start lg:gap-6">
                {{-- Left sidebar ad (horizontal banner on mobile, sticky sidebar on desktop) --}}
                @if ($adLeft)
                    <aside class="mb-6 lg:mb-0 lg:sticky lg:top-24 lg:w-[200px] lg:shrink-0">
                        <x-ad-banner placement="doctor_listing_left" />
                    </aside>
                @endif

                {{-- Center content --}}
                <div class="min-w-0 flex-1">
                    <div class="mb-6 flex items-center justify-between">
                        <p class="text-muted-foreground">
                            Showing <span class="font-semibold text-foreground">{{ $doctors->total() }}</span> doctors
                        </p>
                    </div>

                    @if ($doctors->isNotEmpty())
                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            @foreach ($doctors as $doctor)
                                <x-doctor-card :doctor="$doctor" layout="horizontal" />
                            @endforeach
                        </div>

                        <div class="mt-10">
                            {{ $doctors->links() }}
                        </div>
                    @else
                        <div class="py-16 text-center">
                            <p class="text-lg text-muted-foreground">No doctors found matching your criteria.</p>
                            <x-btn href="{{ route('doctors.index') }}" variant="outline" class="mt-4">Clear Filters</x-btn>
                        </div>
                    @endif
                </div>

                {{-- Right sidebar ad --}}
                @if ($adRight)
                    <aside class="mt-8 lg:mt-0 lg:sticky lg:top-24 lg:w-[200px] lg:shrink-0">
                        <x-ad-banner placement="doctor_listing_right" />
                    </aside>
                @endif
            </div>
        </div>
    </section>
@endsection
