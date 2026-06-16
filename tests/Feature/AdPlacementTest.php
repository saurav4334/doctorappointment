<?php

namespace Tests\Feature;

use App\Models\Advertisement;
use App\Models\Doctor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdPlacementTest extends TestCase
{
    use RefreshDatabase;

    protected function ad(string $placement, array $overrides = []): Advertisement
    {
        return Advertisement::create(array_merge([
            'title' => 'Sponsor '.$placement,
            'image' => 'ads/sample.jpg',
            'redirect_url' => 'https://sponsor.example.com',
            'placement' => $placement,
            'is_active' => true,
            'sort_order' => 0,
        ], $overrides));
    }

    public function test_new_placements_are_accepted_by_admin_validation(): void
    {
        $this->actingAs($this->userWithRole('super_admin'));

        foreach (['doctor_listing_left', 'doctor_listing_right', 'doctor_details_top', 'hospital_details_top'] as $placement) {
            $this->post('/admin/advertisements', [
                'title' => "Ad {$placement}",
                'placement' => $placement,
                'image' => \Illuminate\Http\UploadedFile::fake()->image('a.jpg'),
                'is_active' => 1,
                'sort_order' => 0,
            ])->assertRedirect('/admin/advertisements')->assertSessionDoesntHaveErrors();

            $this->assertDatabaseHas('advertisements', ['title' => "Ad {$placement}", 'placement' => $placement]);
        }
    }

    public function test_doctor_listing_renders_sidebar_ads_and_records_impressions(): void
    {
        Doctor::create(['full_name' => 'Dr. A', 'slug' => 'dr-a', 'is_active' => true]);
        $left = $this->ad('doctor_listing_left');
        $right = $this->ad('doctor_listing_right');

        $this->get(route('doctors.index'))
            ->assertOk()
            ->assertSee(route('ads.click', $left->id), false)
            ->assertSee(route('ads.click', $right->id), false);

        // Each placement rendered once → one impression each.
        $this->assertSame(1, $left->fresh()->impression_count);
        $this->assertSame(1, $right->fresh()->impression_count);
    }

    public function test_doctor_details_top_banner_renders(): void
    {
        $doctor = Doctor::create(['full_name' => 'Dr. Top', 'slug' => 'dr-top', 'is_active' => true]);
        $ad = $this->ad('doctor_details_top');

        $this->get(route('doctors.show', $doctor->slug))
            ->assertOk()
            ->assertSee(route('ads.click', $ad->id), false);

        $this->assertSame(1, $ad->fresh()->impression_count);
    }

    public function test_click_route_records_click_and_redirects(): void
    {
        $ad = $this->ad('doctor_details_top', ['redirect_url' => 'https://sponsor.example.com/landing']);

        $this->get(route('ads.click', $ad->id))
            ->assertRedirect('https://sponsor.example.com/landing');

        $ad->refresh();
        $this->assertSame(1, $ad->click_count);
        $this->assertNotNull($ad->last_clicked_at);
    }

    public function test_click_with_unsafe_url_redirects_home_without_counting(): void
    {
        $ad = $this->ad('doctor_details_top', ['redirect_url' => 'javascript:alert(1)']);

        $this->get(route('ads.click', $ad->id))->assertRedirect(route('home'));

        $this->assertSame(0, $ad->fresh()->click_count);
    }

    public function test_internal_redirect_is_allowed(): void
    {
        $ad = $this->ad('mid_homepage', ['redirect_url' => '/doctors']);

        $this->get(route('ads.click', $ad->id))->assertRedirect('/doctors');
        $this->assertSame(1, $ad->fresh()->click_count);
    }
}
