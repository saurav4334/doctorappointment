<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'sponsor_name',
        'image',
        'redirect_url',
        'placement',
        'is_active',
        'start_date',
        'end_date',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'sort_order' => 'integer',
        'impression_count' => 'integer',
        'click_count' => 'integer',
        'last_clicked_at' => 'datetime',
    ];

    /**
     * Active ads whose scheduling window includes today (null dates = open-ended).
     */
    public function scopeLive(Builder $query): Builder
    {
        $today = now()->toDateString();

        return $query->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('start_date')->orWhere('start_date', '<=', $today))
            ->where(fn ($q) => $q->whereNull('end_date')->orWhere('end_date', '>=', $today));
    }

    public function scopePlacement(Builder $query, string $placement): Builder
    {
        return $query->where('placement', $placement)->orderBy('sort_order');
    }

    /** The single live ad to show for a placement (highest priority = lowest sort_order). */
    public static function liveFor(string $placement): ?self
    {
        return static::live()->placement($placement)->first();
    }

    /** Sanitized redirect target: internal path or http(s) URL only (blocks javascript:, data:). */
    public function safeRedirectUrl(): ?string
    {
        $url = trim((string) $this->redirect_url);
        if ($url === '') {
            return null;
        }
        if (str_starts_with($url, '/')) {
            return $url;
        }
        $scheme = parse_url($url, PHP_URL_SCHEME);

        return in_array($scheme, ['http', 'https'], true) ? $url : null;
    }

    public function isExternalRedirect(): bool
    {
        $url = $this->safeRedirectUrl();

        return $url !== null && ! str_starts_with($url, '/');
    }

    public function recordImpression(): void
    {
        // Single atomic UPDATE; avoids touching updated_at / firing model events.
        static::withoutEvents(fn () => static::whereKey($this->getKey())->increment('impression_count'));
    }

    public function recordClick(): void
    {
        static::withoutEvents(fn () => static::whereKey($this->getKey())->update([
            'click_count' => $this->click_count + 1,
            'last_clicked_at' => now(),
        ]));
    }
}
