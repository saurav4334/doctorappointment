@props([
    'title' => 'Ready to prioritize your health?',
    'subtitle' => 'Book an appointment with a trusted specialist today and take the first step toward better care.',
    'buttonText' => 'Find a Doctor',
    'buttonUrl' => null,
])

<section {{ $attributes->merge(['class' => 'py-16 md:py-24']) }}>
    <div class="container mx-auto px-4">
        <div class="hero-gradient relative overflow-hidden rounded-3xl px-6 py-14 text-center md:px-12 md:py-20">
            <div class="relative mx-auto max-w-2xl">
                <h2 class="font-display text-3xl font-bold text-white md:text-4xl">{{ $title }}</h2>
                <p class="mt-4 text-lg text-white/85">{{ $subtitle }}</p>
                <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <x-btn :href="$buttonUrl ?? url('/doctors')" variant="hero" size="lg">{{ $buttonText }}</x-btn>
                    <x-btn href="tel:+8809678123456" variant="heroOutline" size="lg">Call +880 9678 123456</x-btn>
                </div>
            </div>
        </div>
    </div>
</section>
