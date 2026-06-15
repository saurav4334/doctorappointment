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
        'hero_bottom'   => 'h-[160px] sm:h-[220px] lg:h-[280px]',  // desktop ≤280px
        'mid_homepage'  => 'h-[140px] sm:h-[180px] lg:h-[220px]',  // landscape card
        'footer_banner' => 'h-[100px] sm:h-[120px]',               // slim sponsor strip
        'sidebar'       => 'aspect-[300/600]',
    ];

    public function __construct(public string $placement)
    {
        $this->ad = Advertisement::live()->placement($placement)->first();
        $this->sizeClass = $this->sizeClasses[$placement] ?? $this->sizeClasses['mid_homepage'];

        if ($this->ad) {
            $this->imageUrl = Str::startsWith($this->ad->image, ['http://', 'https://'])
                ? $this->ad->image
                : Storage::url($this->ad->image);
            $this->href = $this->sanitizeUrl($this->ad->redirect_url);
            $this->external = $this->href !== null && ! Str::startsWith($this->href, '/');
        }
    }

    /** Allow only internal paths or http(s) URLs (block javascript:, data:, etc.). */
    protected function sanitizeUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }
        $url = trim($url);
        if (Str::startsWith($url, '/')) {
            return $url;
        }
        $scheme = parse_url($url, PHP_URL_SCHEME);

        return in_array($scheme, ['http', 'https'], true) ? $url : null;
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
