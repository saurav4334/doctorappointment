@php
    $icon = fn ($path) => '<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">'.$path.'</svg>';
@endphp
<footer>
    {{-- Main footer --}}
    <div class="bg-primary text-primary-foreground">
        <div class="container mx-auto px-4 py-10 md:py-14">
            <div class="grid items-start gap-8 md:grid-cols-3">
                {{-- Brand --}}
                <div class="flex items-center justify-center gap-4 md:justify-start">
                    <a href="{{ url('/') }}">
                        <img src="{{ asset('logo.png') }}" alt="Doctors AppointmentBD" class="h-14 object-contain" />
                    </a>
                </div>

                {{-- Address --}}
                <div class="space-y-2 text-center text-sm text-primary-foreground/85">
                    <div class="flex items-start justify-center gap-2">
                        <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                        <span>17-18, Hossain Housing Society, Shyamoli, Dhaka-1215</span>
                    </div>
                    <div class="flex items-center justify-center gap-2">
                        <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
                        <a href="mailto:doctorsappointmentbd@gmail.com" class="hover:underline">doctorsappointmentbd@gmail.com</a>
                    </div>
                    <div class="flex items-center justify-center gap-2">
                        <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.949 8.949 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                        <a href="https://www.doctorsappointmentbd.com" target="_blank" rel="noopener noreferrer" class="hover:underline">www.doctorsappointmentbd.com</a>
                    </div>
                </div>

                {{-- Contact --}}
                <div class="space-y-2 text-center text-sm text-primary-foreground/85 md:text-right">
                    <p class="font-semibold text-primary-foreground">Contact:</p>
                    <a href="tel:+8801720003113" class="flex items-center justify-center gap-2 hover:underline md:justify-end">+880 1720 003113</a>
                    <a href="tel:+8801771588599" class="flex items-center justify-center gap-2 hover:underline md:justify-end">+880 1771 588599</a>
                </div>
            </div>
        </div>
    </div>

    {{-- Bottom bar --}}
    <div class="border-t border-primary-foreground/10 bg-primary/90">
        <div class="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-primary-foreground/60 md:flex-row">
            <p>&copy; {{ date('Y') }} Doctors AppointmentBD. All rights reserved.</p>
            <div class="flex gap-6">
                <a href="{{ url('/page/privacy') }}" class="transition-colors hover:text-primary-foreground">Privacy Policy</a>
                <a href="{{ url('/page/terms') }}" class="transition-colors hover:text-primary-foreground">Terms of Service</a>
            </div>
        </div>
    </div>
</footer>
