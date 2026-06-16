@php
    $support = config('site.support');
    $social = config('site.social');
    $socialIcons = [
        'facebook' => 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.797c0-2.507 1.493-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z',
        'linkedin' => 'M4.98 3.5C4.98 4.881 3.87 6 2.5 6S0 4.881 0 3.5 1.13 1 2.5 1s2.48 1.119 2.48 2.5ZM.22 8h4.56v14H.22V8Zm7.44 0h4.37v1.915h.062c.609-1.154 2.096-2.37 4.314-2.37 4.615 0 5.466 3.037 5.466 6.987V22h-4.555v-6.31c0-1.505-.027-3.44-2.096-3.44-2.098 0-2.42 1.64-2.42 3.332V22H7.66V8Z',
        'youtube' => 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.016 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.546 15.568V8.432L15.818 12l-6.272 3.568Z',
        'twitter' => 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z',
        'pinterest' => 'M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 0 1 .069.288c-.076.315-.245.995-.277 1.135-.044.183-.145.222-.334.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.607-6.052 3.469 0 6.165 2.472 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.526-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2Z',
    ];
@endphp

<div class="bg-primary text-primary-foreground">
    <div class="container mx-auto flex h-9 items-center justify-between gap-3 px-4 text-xs">
        {{-- Left: social + support contacts --}}
        <div class="flex min-w-0 items-center gap-3">
            <div class="hidden items-center gap-2.5 sm:flex">
                @foreach ($socialIcons as $key => $path)
                    @if (!empty($social[$key]))
                        <a href="{{ $social[$key] }}" target="_blank" rel="noopener noreferrer"
                           aria-label="{{ ucfirst($key) }}" class="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                            <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="{{ $path }}"/></svg>
                        </a>
                    @endif
                @endforeach
                <span class="mx-1 hidden h-3 w-px bg-primary-foreground/30 md:inline-block"></span>
            </div>

            <span class="hidden font-medium md:inline">Support:</span>
            <a href="tel:{{ preg_replace('/\s+/', '', $support['ambulance_phone']) }}" class="whitespace-nowrap hover:underline">
                Ambulance: {{ $support['ambulance_phone'] }}
            </a>
            <span class="hidden text-primary-foreground/40 sm:inline">|</span>
            <a href="tel:{{ preg_replace('/\s+/', '', $support['doctor_phone']) }}" class="hidden whitespace-nowrap hover:underline sm:inline">
                Doctor: {{ $support['doctor_phone'] }}
            </a>
            <span class="hidden text-primary-foreground/40 lg:inline">|</span>
            <span class="hidden whitespace-nowrap lg:inline">{{ $support['hours'] }}</span>
            <span class="hidden text-primary-foreground/40 lg:inline">|</span>
            <a href="mailto:{{ $support['email'] }}" class="hidden whitespace-nowrap hover:underline lg:inline">{{ $support['email'] }}</a>
        </div>

        {{-- Right: auth --}}
        <div class="flex shrink-0 items-center gap-3">
            <a href="{{ route('login') }}" class="whitespace-nowrap hover:underline">Sign In</a>
            <a href="{{ route('register') }}"
               class="whitespace-nowrap rounded bg-primary-foreground/15 px-2.5 py-1 font-medium transition-colors hover:bg-primary-foreground/25">
                Sign Up
            </a>
        </div>
    </div>
</div>
