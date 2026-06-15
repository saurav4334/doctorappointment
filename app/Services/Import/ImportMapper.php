<?php

namespace App\Services\Import;

use App\Models\ImportMap;
use Illuminate\Database\Eloquent\Model;

/**
 * Tracks Supabase UUID → new MySQL id so re-imports are idempotent and
 * foreign keys can be remapped across tables.
 */
class ImportMapper
{
    /** In-memory cache: "table:source_id" => target_id */
    protected array $cache = [];

    public function remember(string $sourceTable, ?string $sourceId, Model $model): void
    {
        if (! $sourceId) {
            return;
        }

        ImportMap::updateOrCreate(
            ['source_table' => $sourceTable, 'source_id' => (string) $sourceId],
            ['target_id' => $model->getKey()],
        );

        $this->cache["{$sourceTable}:{$sourceId}"] = $model->getKey();
    }

    /** Resolve a source UUID to the new local id (or null if not imported). */
    public function id(string $sourceTable, mixed $sourceId): ?int
    {
        if (! $sourceId) {
            return null;
        }
        $key = "{$sourceTable}:{$sourceId}";
        if (array_key_exists($key, $this->cache)) {
            return $this->cache[$key];
        }

        $target = ImportMap::where('source_table', $sourceTable)
            ->where('source_id', (string) $sourceId)
            ->value('target_id');

        return $this->cache[$key] = $target ? (int) $target : null;
    }
}
