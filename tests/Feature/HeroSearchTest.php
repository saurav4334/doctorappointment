<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\Hospital;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HeroSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_support_bar_and_search_card_render_on_homepage(): void
    {
        $this->get('/')
            ->assertOk()
            // top support bar
            ->assertSee('Sign Up')
            ->assertSee('Sign In')
            ->assertSee('01635600835')          // ambulance phone (config default)
            ->assertSee('info@doctorsappointmentbd.com')
            // hero appointment search card
            ->assertSee('Get Appointment')
            ->assertSee('>Doctor<', false)
            ->assertSee('>Hospital<', false)
            ->assertSee('>Ambulance<', false);
    }

    public function test_ambulance_page_renders_with_hotline(): void
    {
        $this->get(route('ambulance'))
            ->assertOk()
            ->assertSee('Ambulance')
            ->assertSee('01635600835');
    }

    public function test_doctor_listing_filters_by_city(): void
    {
        $here = Hospital::create(['name' => 'City Hospital', 'slug' => 'city-hospital', 'city' => 'Dhaka', 'is_active' => true]);
        $there = Hospital::create(['name' => 'Far Hospital', 'slug' => 'far-hospital', 'city' => 'Sylhet', 'is_active' => true]);

        Doctor::create(['full_name' => 'Dr. Dhaka', 'slug' => 'dr-dhaka', 'hospital_id' => $here->id, 'is_active' => true]);
        Doctor::create(['full_name' => 'Dr. Sylhet', 'slug' => 'dr-sylhet', 'hospital_id' => $there->id, 'is_active' => true]);

        $this->get('/doctors?city=Dhaka')
            ->assertOk()
            ->assertSee('Dr. Dhaka')
            ->assertDontSee('Dr. Sylhet');
    }

    public function test_hospital_listing_filters_by_city(): void
    {
        Hospital::create(['name' => 'Dhaka Medical', 'slug' => 'dhaka-medical', 'city' => 'Dhaka', 'is_active' => true]);
        Hospital::create(['name' => 'Sylhet Medical', 'slug' => 'sylhet-medical', 'city' => 'Sylhet', 'is_active' => true]);

        $this->get('/hospitals?city=Dhaka')
            ->assertOk()
            ->assertSee('Dhaka Medical')
            ->assertDontSee('Sylhet Medical');
    }
}
