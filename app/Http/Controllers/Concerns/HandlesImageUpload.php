<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait HandlesImageUpload
{
    /**
     * Store an uploaded image on the public disk and return its relative path.
     * Deletes the previous file (if it was a stored path) when replacing.
     */
    protected function storeImage(?UploadedFile $file, string $folder, ?string $previous = null): ?string
    {
        if (! $file) {
            return $previous;
        }

        $this->deleteImage($previous);

        return $file->store($folder, 'public');
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
