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
use Illuminate\Console\Command;

class VerifyImport extends Command
{
    protected $signature = 'import:verify';

    protected $description = 'Report row counts and data-integrity checks after a Supabase import.';

    public function handle(): int
    {
        $this->info('Row counts');
        $this->table(['Table', 'Rows'], [
            ['departments', Department::count()],
            ['hospitals', Hospital::count()],
            ['doctors', Doctor::count()],
            ['doctor_schedules', DoctorSchedule::count()],
            ['testimonials', Testimonial::count()],
            ['hero_slides', HeroSlide::count()],
            ['advertisements', Advertisement::count()],
            ['appointments', Appointment::count()],
        ]);

        $this->newLine();
        $this->info('Integrity checks');

        $checks = [
            ['Doctors with a photo', Doctor::whereNotNull('photo')->count().' / '.Doctor::count()],
            ['Doctors linked to a hospital (hospital_id)', Doctor::whereNotNull('hospital_id')->count()],
            ['Doctors with hospital_name text', Doctor::whereNotNull('hospital_name')->count()],
            ['Featured doctors', Doctor::where('is_featured', true)->count()],
            ['Schedules with a valid doctor', DoctorSchedule::whereHas('doctor')->count().' / '.DoctorSchedule::count()],
            ['Appointments with a valid doctor', Appointment::whereHas('doctor')->count().' / '.Appointment::count()],
            ['Active advertisements', Advertisement::where('is_active', true)->count()],
        ];
        $this->table(['Check', 'Result'], $checks);

        // Warnings for likely problems.
        $warnings = [];
        if ($orphanSchedules = DoctorSchedule::whereDoesntHave('doctor')->count()) {
            $warnings[] = "{$orphanSchedules} schedule(s) reference a missing doctor.";
        }
        if ($orphanAppts = Appointment::whereDoesntHave('doctor')->count()) {
            $warnings[] = "{$orphanAppts} appointment(s) reference a missing doctor.";
        }
        if ($noSlug = Doctor::whereNull('slug')->orWhere('slug', '')->count()) {
            $warnings[] = "{$noSlug} doctor(s) have no slug (profile URLs will break).";
        }

        $this->newLine();
        if ($warnings) {
            $this->warn('Warnings:');
            foreach ($warnings as $w) {
                $this->line('  - '.$w);
            }
        } else {
            $this->info('No integrity warnings. ✔');
        }

        return self::SUCCESS;
    }
}
