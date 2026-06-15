<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\HeroSlide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function makeDoctor(array $overrides = []): Doctor
    {
        return Doctor::create(array_merge([
            'full_name' => 'Dr. Test Doctor',
            'slug' => 'dr-test-doctor',
            'title' => 'MBBS, FCPS',
            'specializations' => ['Cardiology'],
            'qualifications' => ['MBBS'],
            'hospital_name' => 'Test Hospital, Dhaka',
            'experience_years' => 10,
            'consultation_fee' => 800,
            'rating' => 4.8,
            'total_reviews' => 50,
            'bio' => 'Experienced specialist.',
            'is_featured' => true,
            'featured_priority' => 5,
            'is_active' => true,
        ], $overrides));
    }

    public function test_homepage_renders_with_featured_doctor_and_hero(): void
    {
        HeroSlide::create(['title' => 'Welcome Slide', 'is_active' => true, 'sort_order' => 0]);
        $this->makeDoctor(['full_name' => 'Dr. Featured Person', 'slug' => 'dr-featured-person']);

        $this->get('/')
            ->assertOk()
            ->assertSee('Top Rated Doctors')
            ->assertSee('Dr. Featured Person');
    }

    public function test_doctors_listing_shows_active_doctors(): void
    {
        $this->makeDoctor(['full_name' => 'Dr. Listed One', 'slug' => 'dr-listed-one']);
        $this->makeDoctor(['full_name' => 'Dr. Inactive Two', 'slug' => 'dr-inactive-two', 'is_active' => false, 'is_featured' => false]);

        $this->get('/doctors')
            ->assertOk()
            ->assertSee('Find &amp; Book Your Doctor', false)
            ->assertSee('Dr. Listed One')
            ->assertDontSee('Dr. Inactive Two');
    }

    public function test_doctor_profile_renders_by_slug(): void
    {
        $doctor = $this->makeDoctor(['full_name' => 'Dr. Profile Page', 'slug' => 'dr-profile-page']);

        $this->get("/doctors/{$doctor->slug}")
            ->assertOk()
            ->assertSee('Dr. Profile Page')
            ->assertSee('Consultation Fee');
    }

    public function test_inactive_doctor_profile_returns_404(): void
    {
        $doctor = $this->makeDoctor(['slug' => 'hidden-doc', 'is_active' => false, 'is_featured' => false]);

        $this->get("/doctors/{$doctor->slug}")->assertNotFound();
    }
}
