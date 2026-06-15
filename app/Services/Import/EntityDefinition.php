<?php

namespace App\Services\Import;

use Closure;

/**
 * Declarative description of how one Supabase table maps into one MySQL table.
 * Add a new table to the migration by adding one EntityDefinition — no engine changes.
 */
class EntityDefinition
{
    public function __construct(
        public string $sourceTable,           // logical name + import_maps key, e.g. "doctors"
        public string $file,                  // export filename, e.g. "doctors.json"
        public string $modelClass,            // App\Models\Doctor::class
        public Closure $map,                  // fn(array $row, ImportMapper $mapper): array  → attributes
        public ?string $naturalKey = null,    // fallback match column, e.g. "slug"
        public string $imageFolder = 'imports',
        public array $imageFields = [],        // ['photo' => 'photo_url']  (target column => source column)
        public ?Closure $sourceId = null,      // fn(array $row): ?string  (defaults to $row['id'])
    ) {}

    public function sourceIdFor(array $row): ?string
    {
        $id = $this->sourceId ? ($this->sourceId)($row) : ($row['id'] ?? null);

        return $id !== null && $id !== '' ? (string) $id : null;
    }
}
