<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Hospital;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HospitalPageTest extends TestCase
{
    use RefreshDatabase;

    protected function hospital(array $overrides = []): Hospital
    {
        return Hospital::create(array_merge([
            'name' => 'Square Hospital', 'slug' => 'square-hospital',
            'city' => 'Dhaka', 'address' => '18 Bir Uttam Rd',
            'contact_number' => '+880 2 8159457', 'description' => 'Leading tertiary care.',
            'is_active' => true,
        ], $overrides));
    }

    protected function doctorAt(Hospital $hospital, array $overrides = []): Doctor
    {
        return Doctor::create(array_merge([
            'full_name' => 'Dr. Heart Specialist', 'slug' => 'dr-heart-specialist',
            'specializations' => ['Cardiology'], 'hospital_id' => $hospital->id,
            'experience_years' => 12, 'consultation_fee' => 900, 'rating' => 4.8,
            'is_active' => true,
        ], $overrides));
    }

    public function test_hospital_listing_links_to_detail_page(): void
    {
        $hospital = $this->hospital();

        $this->get(route('hospitals.index'))
            ->assertOk()
            ->assertSee('Square Hospital')
            ->assertSee(route('hospitals.show', $hospital->slug));
    }

    public function test_homepage_hospital_card_links_to_detail(): void
    {
        $hospital = $this->hospital();

        $this->get('/')
            ->assertOk()
            ->assertSee(route('hospitals.show', $hospital->slug));
    }

    public function test_detail_page_renders_hospital_info(): void
    {
        $hospital = $this->hospital();

        $this->get(route('hospitals.show', $hospital->slug))
            ->assertOk()
            ->assertSee('Square Hospital')
            ->assertSee('Dhaka')
            ->assertSee('+880 2 8159457')
            ->assertSee('Leading tertiary care.');
    }

    public function test_detail_page_shows_assigned_doctors_with_booking_button(): void
    {
        $hospital = $this->hospital();
        $doctor = $this->doctorAt($hospital);
        DoctorSchedule::create([
            'doctor_id' => $doctor->id, 'day_of_week' => 6,
            'start_time' => '18:00', 'end_time' => '21:00', 'is_active' => true,
        ]);

        $this->get(route('hospitals.show', $hospital->slug))
            ->assertOk()
            ->assertSee('Dr. Heart Specialist')
            ->assertSee('Book Now')
            // booking button carries the doctor profile URL with hospital context
            ->assertSee(route('doctors.show', $doctor->slug).'?hospital='.$hospital->id, false)
            ->assertSee('Available:'); // schedule summary
    }

    public function test_inactive_doctor_not_shown_on_hospital_page(): void
    {
        $hospital = $this->hospital();
        $this->doctorAt($hospital, ['full_name' => 'Dr. Hidden', 'slug' => 'dr-hidden', 'is_active' => false]);

        $this->get(route('hospitals.show', $hospital->slug))
            ->assertOk()
            ->assertDontSee('Dr. Hidden');
    }

    public function test_empty_hospital_shows_empty_state(): void
    {
        $hospital = $this->hospital(['name' => 'Empty Clinic', 'slug' => 'empty-clinic']);

        $this->get(route('hospitals.show', $hospital->slug))
            ->assertOk()
            ->assertSee('No doctors are currently listed for this hospital.');
    }

    public function test_inactive_hospital_returns_404(): void
    {
        $hospital = $this->hospital(['slug' => 'closed-hospital', 'is_active' => false]);

        $this->get(route('hospitals.show', $hospital->slug))->assertNotFound();
    }
}
