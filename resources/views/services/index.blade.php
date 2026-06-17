@extends('layouts.public')

@section('title', 'Healthcare Services — Doctors AppointmentBD')
@section('meta_description', 'Doctor appointments, diagnostics, ambulance, home physiotherapy, nursing care and more — healthcare services around you.')

@section('content')
    <section class="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 md:py-16">
        <div class="container mx-auto px-4 text-center">
            <h1 class="font-display text-3xl font-bold text-foreground md:text-4xl">Healthcare Services Around You</h1>
            <p class="mt-4 text-lg text-muted-foreground">Everything you need for your family's health, in one place.</p>
        </div>
    </section>

    <section class="py-12 md:py-16">
        <div class="container mx-auto px-4">
            @if ($services->isEmpty())
                <p class="py-16 text-center text-lg text-muted-foreground">No services listed yet.</p>
            @else
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    @foreach ($services as $service)
                        <x-service-card :service="$service" />
                    @endforeach
                </div>
            @endif
        </div>
    </section>
@endsection
