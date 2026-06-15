<?php

namespace App\Console\Commands;

use App\Models\Advertisement;
use App\Models\Appointment;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\HeroSlide;
use App\Models\Hospital;
use App\Models\Testimonial;
use App\Services\Import\EntityDefinition;
use App\Services\Import\EntityImporter;
use App\Services\Import\ImageMigrator;
use App\Services\Import\ImportMapper;
use App\Services\Import\SourceReader;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportSupabase extends Command
{
    protected $signature = 'import:supabase
        {--path=storage/app/imports : Directory containing the Supabase export files}
        {--only= : Comma-separated list of tables to import (default: all)}
        {--dry-run : Run inside a transaction and roll back; reports counts without persisting}
        {--download-images : Download images into local storage instead of keeping Supabase URLs}
        {--storage-base= : Public base URL for Supabase Storage (to resolve bucket-relative paths)}';

    protected $description = 'Import Supabase CSV/JSON exports into the MySQL database (idempotent).';

    protected ImportMapper $mapper;
    protected SourceReader $reader;
    protected EntityImporter $engine;
    protected ImageMigrator $images;

    public function handle(): int
    {
        $dir = base_path($this->option('path'));
        if (! is_dir($dir)) {
            $this->error("Import directory not found: {$dir}");

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $only = array_filter(array_map('trim', explode(',', (string) $this->option('only'))));

        $this->mapper = new ImportMapper;
        $this->reader = new SourceReader;
        $this->images = new ImageMigrator(
            download: (bool) $this->option('download-images') && ! $dryRun,
            storageBase: $this->option('storage-base'),
        );
        $this->engine = new EntityImporter($this->mapper, $this->images);

        $this->info(($dryRun ? '[DRY RUN] ' : '').'Importing from: '.$dir);
        $this->newLine();

        DB::beginTransaction();
        try {
            foreach ($this->definitions() as $def) {
                if ($only && ! in_array($def->sourceTable, $only, true)) {
                    continue;
                }
                $this->runDefinition($def, $dir);
            }

            if (! $only || in_array('doctor_hospitals', $only, true)) {
                $this->enrichDoctorAffiliations($dir);
            }

            if ($dryRun) {
                DB::rollBack();
                $this->newLine();
                $this->warn('Dry run complete — all changes rolled back.');
            } else {
                DB::commit();
                $this->newLine();
                $this->info('Import committed successfully.');
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Import failed and was rolled back: '.$e->getMessage());
            $this->line($e->getFile().':'.$e->getLine());

            return self::FAILURE;
        }

        if ($this->images->failures) {
            $this->newLine();
            $this->warn('Image issues ('.count($this->images->failures).'):');
            foreach (array_slice($this->images->failures, 0, 15) as $f) {
                $this->line('  - '.$f);
            }
        }

        return self::SUCCESS;
    }

    protected function runDefinition(EntityDefinition $def, string $dir): void
    {
        $path = $dir.DIRECTORY_SEPARATOR.$def->file;
        if (! is_file($path)) {
            $this->line(sprintf('  <fg=gray>skip</> %-16s (no %s)', $def->sourceTable, $def->file));

            return;
        }

        $rows = $this->reader->read($path);
        $r = $this->engine->import($def, $rows);
        $this->line(sprintf(
            '  <info>ok</info>   %-16s created %d · updated %d · skipped %d  (%d rows)',
            $def->sourceTable, $r['created'], $r['updated'], $r['skipped'], count($rows)
        ));
    }

    /**
     * Optional: use the Supabase doctor_hospitals pivot to set each doctor's
     * primary hospital_id / department_id (UUIDs remapped via import_maps).
     */
    protected function enrichDoctorAffiliations(string $dir): void
    {
        $path = $dir.DIRECTORY_SEPARATOR.'doctor_hospitals.json';
        if (! is_file($path)) {
            $path = $dir.DIRECTORY_SEPARATOR.'doctor_hospitals.csv';
        }
        if (! is_file($path)) {
            return;
        }

        $rows = $this->reader->read($path);
        $applied = 0;
        $seen = [];
        foreach ($rows as $row) {
            $doctorId = $this->mapper->id('doctors', $row['doctor_id'] ?? null);
            if (! $doctorId) {
                continue;
            }
            $isPrimary = SourceReader::toBool($row['is_primary'] ?? false);
            // Prefer the primary row; otherwise take the first seen for the doctor.
            if (isset($seen[$doctorId]) && ! $isPrimary) {
                continue;
            }
            $seen[$doctorId] = true;

            Doctor::whereKey($doctorId)->update(array_filter([
                'hospital_id' => $this->mapper->id('hospitals', $row['hospital_id'] ?? null),
                'department_id' => $this->mapper->id('departments', $row['department_id'] ?? null),
            ], fn ($v) => $v !== null));
            $applied++;
        }
        $this->line(sprintf('  <info>ok</info>   %-16s applied %d affiliations', 'doctor_hospitals', $applied));
    }

    /**
     * The Supabase → MySQL mapping, in dependency order.
     *
     * @return EntityDefinition[]
     */
    protected function definitions(): array
    {
        $r = SourceReader::class;

        return [
            new EntityDefinition(
                sourceTable: 'departments',
                file: 'departments.json',
                modelClass: Department::class,
                naturalKey: 'slug',
                map: fn (array $row) => [
                    'name' => $r::nullableString($row['name'] ?? null),
                    'slug' => $r::nullableString($row['slug'] ?? null) ?: Str::slug($row['name'] ?? ''),
                    'icon' => $r::nullableString($row['icon'] ?? null, 50),
                    'description' => $r::nullableString($row['description'] ?? null, 500),
                    'sort_order' => $r::toIntOrZero($row['sort_order'] ?? 0),
                    'is_active' => $r::toBool($row['is_active'] ?? true, true),
                ],
            ),

            new EntityDefinition(
                sourceTable: 'hospitals',
                file: 'hospitals.json',
                modelClass: Hospital::class,
                naturalKey: 'slug',
                imageFolder: 'hospitals',
                imageFields: ['image' => ['image_url', 'image', 'photo_url', 'logo']],
                map: fn (array $row) => [
                    'name' => $r::nullableString($row['name'] ?? null),
                    'slug' => $r::nullableString($row['slug'] ?? null) ?: Str::slug($row['name'] ?? ''),
                    'city' => $r::nullableString($row['city'] ?? null, 100),
                    'address' => $r::nullableString($row['address'] ?? null, 255),
                    'description' => $r::nullableString($row['description'] ?? null, 1000),
                    'contact_number' => $r::nullableString($row['contact_number'] ?? $row['phone'] ?? $row['contact'] ?? null, 30),
                    'is_active' => array_key_exists('is_active', $row)
                        ? $r::toBool($row['is_active'], true)
                        : (($row['status'] ?? 'approved') === 'approved'),
                ],
            ),

            new EntityDefinition(
                sourceTable: 'doctors',
                file: 'doctors.json',
                modelClass: Doctor::class,
                naturalKey: 'slug',
                imageFolder: 'doctors',
                imageFields: ['photo' => ['photo_url', 'photo', 'image_url', 'image']],
                map: fn (array $row) => [
                    'full_name' => $r::nullableString($row['full_name'] ?? $row['name'] ?? null),
                    'slug' => $r::nullableString($row['slug'] ?? null) ?: Str::slug($row['full_name'] ?? $row['name'] ?? ''),
                    'title' => $r::nullableString($row['title'] ?? null, 100),
                    'specializations' => $r::toArray($row['specializations'] ?? null),
                    'qualifications' => $r::toArray($row['qualifications'] ?? null),
                    'gender' => $r::nullableString($row['gender'] ?? null, 20),
                    'hospital_name' => $r::nullableString($row['hospital_name'] ?? null, 150),
                    'experience_years' => $r::toIntOrZero($row['experience_years'] ?? 0),
                    'consultation_fee' => $r::toFloatOrZero($row['consultation_fee'] ?? 0),
                    'rating' => $r::toFloatOrZero($row['rating'] ?? 0),
                    'total_reviews' => $r::toIntOrZero($row['total_reviews'] ?? 0),
                    'bio' => $r::nullableString($row['bio'] ?? null),
                    'is_featured' => $r::toBool($row['is_featured'] ?? false),
                    'featured_priority' => $r::toIntOrZero($row['featured_priority'] ?? 0),
                    'is_active' => $r::toBool($row['is_active'] ?? true, true),
                ],
            ),

            new EntityDefinition(
                sourceTable: 'doctor_schedules',
                file: 'doctor_schedules.json',
                modelClass: DoctorSchedule::class,
                map: function (array $row, ImportMapper $m) use ($r) {
                    $doctorId = $m->id('doctors', $row['doctor_id'] ?? null);
                    if (! $doctorId) {
                        return []; // doctor not imported → skip
                    }

                    return [
                        'doctor_id' => $doctorId,
                        'hospital_id' => $m->id('hospitals', $row['hospital_id'] ?? null),
                        'day_of_week' => $r::toIntOrZero($row['day_of_week'] ?? 0),
                        'start_time' => $r::toTime($row['start_time'] ?? null),
                        'end_time' => $r::toTime($row['end_time'] ?? null),
                        'slot_duration' => $r::toIntOrZero($row['slot_duration'] ?? 30) ?: 30,
                        'is_active' => $r::toBool($row['is_active'] ?? true, true),
                    ];
                },
            ),

            new EntityDefinition(
                sourceTable: 'testimonials',
                file: 'testimonials.json',
                modelClass: Testimonial::class,
                imageFolder: 'testimonials',
                imageFields: ['image' => ['image_url', 'image', 'photo_url', 'avatar']],
                map: fn (array $row) => [
                    'patient_name' => $r::nullableString($row['patient_name'] ?? $row['name'] ?? 'Patient'),
                    'review' => $r::nullableString($row['review'] ?? $row['content'] ?? $row['message'] ?? null),
                    'rating' => $r::toIntOrZero($row['rating'] ?? 5) ?: 5,
                    'is_active' => $r::toBool($row['is_active'] ?? true, true),
                    'sort_order' => $r::toIntOrZero($row['sort_order'] ?? 0),
                ],
            ),

            new EntityDefinition(
                sourceTable: 'hero_slides',
                file: 'hero_slides.json',
                modelClass: HeroSlide::class,
                imageFolder: 'hero-slides',
                imageFields: ['image' => ['image_url', 'image']],
                map: fn (array $row) => [
                    'title' => $r::nullableString($row['title'] ?? null),
                    'subtitle' => $r::nullableString($row['subtitle'] ?? null, 500),
                    'button_text' => $r::nullableString($row['button_text'] ?? $row['cta_text'] ?? null, 100),
                    'button_url' => $r::nullableString($row['button_url'] ?? $row['cta_link'] ?? null, 255),
                    'sort_order' => $r::toIntOrZero($row['sort_order'] ?? 0),
                    'is_active' => $r::toBool($row['is_active'] ?? true, true),
                ],
            ),

            new EntityDefinition(
                sourceTable: 'advertisements',
                file: 'advertisements.json',
                modelClass: Advertisement::class,
                imageFolder: 'ads',
                imageFields: ['image' => ['image_url', 'image']],
                map: fn (array $row) => [
                    'title' => $r::nullableString($row['title'] ?? null),
                    'sponsor_name' => $r::nullableString($row['sponsor_name'] ?? null),
                    'redirect_url' => $r::nullableString($row['redirect_url'] ?? null, 500),
                    'placement' => $r::nullableString($row['placement'] ?? 'mid_homepage') ?: 'mid_homepage',
                    'is_active' => $r::toBool($row['is_active'] ?? true, true),
                    'start_date' => $r::toDate($row['start_date'] ?? null),
                    'end_date' => $r::toDate($row['end_date'] ?? null),
                    'sort_order' => $r::toIntOrZero($row['sort_order'] ?? 0),
                ],
            ),

            new EntityDefinition(
                sourceTable: 'appointments',
                file: 'appointments.json',
                modelClass: Appointment::class,
                map: function (array $row, ImportMapper $m) use ($r) {
                    $doctorId = $m->id('doctors', $row['doctor_id'] ?? null);
                    if (! $doctorId) {
                        return []; // doctor not imported → skip
                    }
                    $status = strtolower((string) ($row['status'] ?? 'pending'));
                    $payment = strtolower((string) ($row['payment_status'] ?? 'unpaid'));

                    return [
                        'doctor_id' => $doctorId,
                        'hospital_id' => $m->id('hospitals', $row['hospital_id'] ?? null),
                        'patient_id' => null, // patient accounts are not migrated
                        'patient_name' => $r::nullableString($row['patient_name'] ?? $row['name'] ?? 'Unknown'),
                        'patient_phone' => $r::nullableString($row['patient_phone'] ?? $row['phone'] ?? 'N/A', 20),
                        'patient_email' => $r::nullableString($row['patient_email'] ?? $row['email'] ?? null),
                        'appointment_date' => $r::toDate($row['appointment_date'] ?? null),
                        'appointment_time' => $r::toTime($row['appointment_time'] ?? null) ?: '09:00',
                        'status' => in_array($status, ['pending', 'confirmed', 'completed', 'cancelled'], true) ? $status : 'pending',
                        'payment_status' => in_array($payment, ['unpaid', 'paid', 'refunded'], true) ? $payment : 'unpaid',
                        'notes' => $r::nullableString($row['notes'] ?? null, 1000),
                    ];
                },
            ),
        ];
    }
}
