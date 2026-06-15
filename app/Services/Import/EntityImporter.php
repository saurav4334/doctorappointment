<?php

namespace App\Services\Import;

use Illuminate\Database\Eloquent\Model;

/**
 * Runs a single EntityDefinition over a set of rows: maps fields, migrates images,
 * and performs an idempotent upsert (matched first by import_maps, then natural key).
 */
class EntityImporter
{
    public function __construct(
        protected ImportMapper $mapper,
        protected ImageMigrator $images,
    ) {}

    /**
     * @param  array<int, array<string,mixed>>  $rows
     * @return array{created:int, updated:int, skipped:int}
     */
    public function import(EntityDefinition $def, array $rows): array
    {
        $created = $updated = $skipped = 0;
        $modelClass = $def->modelClass;

        foreach ($rows as $row) {
            if (! is_array($row)) {
                $skipped++;
                continue;
            }

            $attributes = ($def->map)($row, $this->mapper);

            // Required-field guard: skip empty rows rather than inserting junk.
            if ($this->isBlank($attributes)) {
                $skipped++;
                continue;
            }

            foreach ($def->imageFields as $target => $sourceCols) {
                $raw = null;
                foreach ((array) $sourceCols as $col) {
                    if (! empty($row[$col])) {
                        $raw = $row[$col];
                        break;
                    }
                }
                $attributes[$target] = $this->images->migrate($raw, $def->imageFolder);
            }

            $sourceId = $def->sourceIdFor($row);
            $model = $this->findExisting($def, $sourceId, $attributes);

            if ($model) {
                $model->fill($attributes)->save();
                $updated++;
            } else {
                $model = $modelClass::create($attributes);
                $created++;
            }

            $this->mapper->remember($def->sourceTable, $sourceId, $model);
        }

        return compact('created', 'updated', 'skipped');
    }

    protected function findExisting(EntityDefinition $def, ?string $sourceId, array $attributes): ?Model
    {
        $modelClass = $def->modelClass;

        if ($sourceId && ($id = $this->mapper->id($def->sourceTable, $sourceId))) {
            if ($found = $modelClass::find($id)) {
                return $found;
            }
        }

        if ($def->naturalKey && ! empty($attributes[$def->naturalKey])) {
            return $modelClass::where($def->naturalKey, $attributes[$def->naturalKey])->first();
        }

        return null;
    }

    protected function isBlank(array $attributes): bool
    {
        foreach ($attributes as $value) {
            if (is_array($value) ? ! empty($value) : ($value !== null && $value !== '')) {
                return false;
            }
        }

        return true;
    }
}
