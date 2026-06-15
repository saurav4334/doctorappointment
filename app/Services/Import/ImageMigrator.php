<?php

namespace App\Services\Import;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Resolves an image reference from a Supabase export into a value we can store.
 *
 * Modes:
 *  - keep (default): return the public URL as-is (Blade already renders http(s) URLs).
 *  - download: fetch the file into storage/app/public/{folder} and return the relative path.
 *
 * Falls back gracefully: on any download failure it returns the resolved URL so the
 * site keeps working, and the failure is recorded for the import report.
 */
class ImageMigrator
{
    /** @var array<int, string> */
    public array $failures = [];

    public function __construct(
        protected bool $download = false,
        protected ?string $storageBase = null,
    ) {}

    public function migrate(mixed $value, string $folder): ?string
    {
        $value = is_string($value) ? trim($value) : $value;
        if (! $value) {
            return null;
        }

        $url = $this->resolveUrl($value);

        if (! $this->download) {
            return $url ?? $value;
        }

        if (! $url) {
            // Relative path with no storage base to resolve against — keep original as fallback.
            $this->failures[] = "Could not resolve URL for image: {$value}";

            return $value;
        }

        try {
            $response = Http::timeout(25)->retry(2, 300)->get($url);
            if (! $response->successful()) {
                throw new \RuntimeException("HTTP {$response->status()}");
            }
            $ext = $this->guessExtension($url, $response->header('Content-Type'));
            $path = $folder.'/'.Str::random(20).'.'.$ext;
            Storage::disk('public')->put($path, $response->body());

            return $path;
        } catch (\Throwable $e) {
            $this->failures[] = "Failed to download {$url}: {$e->getMessage()}";

            return $url; // fallback to remote URL
        }
    }

    /** Build an absolute URL from a full URL or a bucket-relative path + storage base. */
    protected function resolveUrl(string $value): ?string
    {
        if (Str::startsWith($value, ['http://', 'https://'])) {
            return $value;
        }
        if ($this->storageBase) {
            return rtrim($this->storageBase, '/').'/'.ltrim($value, '/');
        }

        return null;
    }

    protected function guessExtension(string $url, ?string $contentType): string
    {
        $fromUrl = strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
        if (in_array($fromUrl, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'], true)) {
            return $fromUrl;
        }

        return match (true) {
            str_contains((string) $contentType, 'png') => 'png',
            str_contains((string) $contentType, 'webp') => 'webp',
            str_contains((string) $contentType, 'gif') => 'gif',
            str_contains((string) $contentType, 'svg') => 'svg',
            default => 'jpg',
        };
    }
}
