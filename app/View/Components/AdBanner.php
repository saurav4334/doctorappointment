<?php

namespace App\View\Components;

use App\Models\Advertisement;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\Component;

class AdBanner extends Component
{
    public ?Advertisement $ad;
    public ?string $imageUrl = null;
    public ?string $href = null;
    public bool $external = false;
    public string $sizeClass;

    /**
     * Responsive, height-capped sizing per placement (PRD v2.0 — keeps banners
     * subtle and balanced instead of oversized).
     */
    protected array $sizeClasses = [
        'hero_bottom'          => 'h-[90px] md:h-[160px]',     // slim sponsor banner
        'mid_homepage'         => 'h-[110px] md:h-[180px]',    // compact landscape banner
        'footer_banner'        => 'h-[60px] md:h-[80px]',      // slim sponsor strip
        'sidebar'              => 'aspect-[300/600]',
        // New: tall sidebars on desktop, horizontal responsive banners on mobile.
        'doctor_listing_left'  => 'h-[110px] lg:h-[600px]',
        'doctor_listing_right' => 'h-[110px] lg:h-[600px]',
        // New: wide-short top banners (~490x70), responsive.
        'doctor_details_top'   => 'h-[64px] md:h-[70px]',
        'hospital_details_top' => 'h-[64px] md:h-[70px]',
    ];

    /** Placements positioned by the page itself (no auto content container). */
    protected array $bare = ['sidebar', 'doctor_listing_left', 'doctor_listing_right', 'doctor_details_top', 'hospital_details_top'];

    public bool $isBare;

    public function __construct(public string $placement)
    {
        $this->ad = Advertisement::liveFor($placement);
        $this->sizeClass = $this->sizeClasses[$placement] ?? $this->sizeClasses['mid_homepage'];
        $this->isBare = in_array($placement, $this->bare, true);

        if ($this->ad) {
            $this->ad->recordImpression();

            $this->imageUrl = Str::startsWith($this->ad->image, ['http://', 'https://'])
                ? $this->ad->image
                : Storage::disk('public')->url($this->ad->image);

            // Clicks go through a tracking redirect (records click_count + last_clicked_at).
            $this->href = $this->ad->safeRedirectUrl() ? route('ads.click', $this->ad->id) : null;
            $this->external = $this->ad->isExternalRedirect();
        }
    }


    public function shouldRender(): bool
    {
        return $this->ad !== null;
    }

    public function render()
    {
        return view('components.ad-banner');
    }
}
