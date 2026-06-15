<?php

namespace App\Services\Import;

use RuntimeException;

/**
 * Reads Supabase exports (.json, .ndjson, .csv) into a list of associative rows,
 * and normalizes Postgres-flavoured values (arrays, booleans, dates) for MySQL.
 */
class SourceReader
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function read(string $path): array
    {
        if (! is_file($path)) {
            throw new RuntimeException("Export file not found: {$path}");
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $contents = file_get_contents($path);

        return match ($ext) {
            'json' => $this->readJson($contents),
            'ndjson', 'jsonl' => $this->readNdjson($contents),
            'csv' => $this->readCsv($path),
            default => throw new RuntimeException("Unsupported export format: .{$ext} (use json, ndjson or csv)"),
        };
    }

    protected function readJson(string $contents): array
    {
        $data = json_decode($contents, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('Invalid JSON: '.json_last_error_msg());
        }
        // Accept either a bare array or a { "data": [...] } / { "rows": [...] } wrapper.
        if (isset($data['data']) && is_array($data['data'])) {
            return $data['data'];
        }
        if (isset($data['rows']) && is_array($data['rows'])) {
            return $data['rows'];
        }

        return is_array($data) ? $data : [];
    }

    protected function readNdjson(string $contents): array
    {
        $rows = [];
        foreach (preg_split('/\r?\n/', trim($contents)) as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }
            $decoded = json_decode($line, true);
            if (is_array($decoded)) {
                $rows[] = $decoded;
            }
        }

        return $rows;
    }

    protected function readCsv(string $path): array
    {
        $rows = [];
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);
        if (! $header) {
            fclose($handle);

            return [];
        }
        $header = array_map('trim', $header);
        while (($line = fgetcsv($handle)) !== false) {
            if (count($line) === 1 && $line[0] === null) {
                continue;
            }
            $rows[] = array_combine($header, array_pad($line, count($header), null));
        }
        fclose($handle);

        return $rows;
    }

    // ---- Value normalizers (static helpers usable from mapping closures) ----

    /**
     * Normalize array-ish values: PHP array, JSON array string, Postgres '{a,b}' literal, or CSV string.
     */
    public static function toArray(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('trim', $value), fn ($v) => $v !== '' && $v !== null));
        }
        if ($value === null || $value === '') {
            return [];
        }
        $str = trim((string) $value);

        // JSON array
        if (str_starts_with($str, '[')) {
            $decoded = json_decode($str, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('trim', $decoded), fn ($v) => $v !== ''));
            }
        }
        // Postgres array literal: {Cardiology,"Internal Medicine"}
        if (str_starts_with($str, '{') && str_ends_with($str, '}')) {
            $inner = substr($str, 1, -1);
            if ($inner === '') {
                return [];
            }
            $parts = str_getcsv($inner); // handles quoted commas
            return array_values(array_filter(array_map(fn ($p) => trim($p, " \t\""), $parts), fn ($v) => $v !== ''));
        }

        // Plain comma-separated
        return array_values(array_filter(array_map('trim', explode(',', $str)), fn ($v) => $v !== ''));
    }

    public static function toBool(mixed $value, bool $default = false): bool
    {
        if ($value === null || $value === '') {
            return $default;
        }
        if (is_bool($value)) {
            return $value;
        }

        return in_array(strtolower((string) $value), ['1', 'true', 't', 'yes', 'y', 'on'], true);
    }

    public static function toIntOrZero(mixed $value): int
    {
        return is_numeric($value) ? (int) $value : 0;
    }

    public static function toFloatOrZero(mixed $value): float
    {
        return is_numeric($value) ? (float) $value : 0.0;
    }

    /** Normalize a date/datetime to Y-m-d (or null). */
    public static function toDate(mixed $value): ?string
    {
        if (! $value) {
            return null;
        }
        try {
            return \Illuminate\Support\Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    /** Normalize a time value to H:i (or null). */
    public static function toTime(mixed $value): ?string
    {
        if (! $value) {
            return null;
        }
        try {
            return \Illuminate\Support\Carbon::parse($value)->format('H:i');
        } catch (\Throwable) {
            return \Illuminate\Support\Str::substr((string) $value, 0, 5) ?: null;
        }
    }

    public static function nullableString(mixed $value, ?int $max = null): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        $str = trim((string) $value);

        return $max ? \Illuminate\Support\Str::limit($str, $max, '') : $str;
    }
}
