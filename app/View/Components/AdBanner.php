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
    public string $aspect;

    /** Tailwind aspect helpers per placement (PRD banner sizes). */
    protected array $aspects = [
        'hero_bottom'   => 'aspect-[1920/300] min-h-[120px]',
        'mid_homepage'  => 'aspect-[1200/250] min-h-[120px]',
        'sidebar'       => 'aspect-[300/600]',
        'footer_banner' => 'aspect-[1200/250] min-h-[120px]',
    ];

    public function __construct(public string $placement)
    {
        $this->ad = Advertisement::live()->placement($placement)->first();
        $this->aspect = $this->aspects[$placement] ?? $this->aspects['mid_homepage'];

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
