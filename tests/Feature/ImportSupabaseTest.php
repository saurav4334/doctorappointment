<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\ImportMap;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImportSupabaseTest extends TestCase
{
    use RefreshDatabase;

    /** Path is relative to base_path(), as the command expects. */
    protected string $samples = 'database/import-samples';

    public function test_dry_run_does_not_persist_data(): void
    {
        $this->assertSame(0, Doctor::count());

        $this->artisan("import:supabase --path={$this->samples} --dry-run")
            ->assertSuccessful();

        $this->assertSame(0, Doctor::count(), 'Dry run must not persist rows.');
        $this->assertSame(0, Department::count());
        $this->assertSame(0, ImportMap::count(), 'Dry run must not persist import maps.');
    }

    public function test_real_import_persists_and_remaps_relations(): void
    {
        $this->artisan("import:supabase --path={$this->samples}")->assertSuccessful();

        // Rows imported.
        $this->assertSame(2, Doctor::count());
        $this->assertSame(2, Department::count());

        // Array fields parsed (JSON array + Postgres {literal}).
        $ayesha = Doctor::where('slug', 'dr-sample-ayesha-rahman')->first();
        $this->assertEqualsCanonicalizing(['Cardiology', 'Internal Medicine'], $ayesha->specializations);

        // Foreign keys remapped from UUID → local id.
        $this->assertGreaterThan(0, DoctorSchedule::whereHas('doctor')->count());
        $this->assertNotNull($ayesha->hospital_id, 'doctor_hospitals enrichment should set hospital_id');
        $this->assertNotNull($ayesha->department_id);
    }

    public function test_import_maps_prevent_duplicates_on_reimport(): void
    {
        $this->artisan("import:supabase --path={$this->samples}")->assertSuccessful();
        $firstCount = Doctor::count();
        $mapCount = ImportMap::where('source_table', 'doctors')->count();

        // Run again — should update in place, not duplicate.
        $this->artisan("import:supabase --path={$this->samples}")->assertSuccessful();

        $this->assertSame($firstCount, Doctor::count(), 'Re-import must not create duplicates.');
        $this->assertSame($mapCount, ImportMap::where('source_table', 'doctors')->count());
    }
}
