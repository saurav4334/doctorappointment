@extends('layouts.public')

@section('title', 'Ambulance Service — Doctors AppointmentBD')
@section('meta_description', 'Request emergency ambulance transport. 24/7 ambulance hotline.')

@section('content')
    <section class="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 md:py-16">
        <div class="container mx-auto px-4 text-center">
            <h1 class="font-display text-3xl font-bold text-foreground md:text-4xl">Ambulance Service</h1>
            <p class="mt-4 text-lg text-muted-foreground">24/7 emergency ambulance support across the city.</p>
        </div>
    </section>

    <section class="py-12 md:py-16">
        <div class="container mx-auto max-w-2xl px-4">
            <div class="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-6.75M14.25 8.25h-3.75m0 0V6m0 2.25V10.5"/></svg>
                </div>
                <h2 class="mt-4 font-display text-xl font-semibold text-foreground">Emergency Ambulance Hotline</h2>
                <p class="mt-2 text-sm text-muted-foreground">Call now for the fastest response.</p>

                <a href="tel:{{ preg_replace('/\s+/', '', $phone) }}"
                   class="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
                    {{ $phone }}
                </a>

                <p class="mt-6 text-xs text-muted-foreground">Online ambulance booking is coming soon. For now, please call the hotline for immediate assistance.</p>
            </div>
        </div>
    </section>
@endsection
