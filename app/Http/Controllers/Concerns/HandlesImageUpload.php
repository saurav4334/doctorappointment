<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

trait HandlesImageUpload
{
    /**
     * Store an uploaded image on the public disk and return its relative path.
     *
     * - Keeps the previous image if no new file is uploaded.
     * - Ensures the target folder exists.
     * - Deletes the old file ONLY after the new one is stored successfully.
     * - Throws on storage failure so the caller can fail gracefully (old image intact).
     */
    protected function storeImage(?UploadedFile $file, string $folder, ?string $previous = null): ?string
    {
        if (! $file) {
            return $previous;
        }

        $disk = Storage::disk('public');
        $disk->makeDirectory($folder);

        // storePublicly preserves the original file bytes (no resize), so animated
        // GIFs and WebP transparency are kept intact.
        $path = $file->storePublicly($folder, 'public');

        if (! $path || ! $disk->exists($path)) {
            throw new RuntimeException('The image could not be saved to storage.');
        }

        // New file is safely stored — now remove the old one.
        if ($previous && $previous !== $path) {
            $this->deleteImage($previous);
        }

        return $path;
    }

    /**
     * Delete a previously stored image. Ignores external URLs and empty values.
     */
    protected function deleteImage(?string $path): void
    {
        if ($path && ! str_starts_with($path, 'http://') && ! str_starts_with($path, 'https://')) {
            Storage::disk('public')->delete($path);
        }
    }
}
