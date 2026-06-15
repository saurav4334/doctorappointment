<?php

namespace Tests\Feature\Admin;

use App\Models\Advertisement;
use App\Models\Department;
use App\Models\Doctor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs($this->userWithRole('super_admin'));
    }

    // ---- Doctors ----

    public function test_can_create_doctor(): void
    {
        $response = $this->post('/admin/doctors', [
            'title' => 'Dr.',
            'full_name' => 'Dr. New Doctor',
            'specializations' => 'Cardiology, Internal Medicine',
            'qualifications' => 'MBBS, FCPS',
            'hospital_name' => 'Central Hospital',
            'experience_years' => 12,
            'consultation_fee' => 900,
            'rating' => 4.5,
            'is_featured' => 1,
            'featured_priority' => 3,
            'is_active' => 1,
        ]);

        $response->assertRedirect('/admin/doctors');
        $this->assertDatabaseHas('doctors', [
            'full_name' => 'Dr. New Doctor',
            'slug' => 'dr-new-doctor',
            'is_featured' => 1,
        ]);
        // Comma-separated input is normalized to an array column.
        $this->assertEquals(['Cardiology', 'Internal Medicine'], Doctor::first()->specializations);
    }

    public function test_doctor_creation_requires_name(): void
    {
        $this->post('/admin/doctors', ['full_name' => ''])
            ->assertSessionHasErrors('full_name');
    }

    public function test_can_update_doctor(): void
    {
        $doctor = Doctor::create([
            'full_name' => 'Dr. Old Name', 'slug' => 'dr-old-name', 'is_active' => true,
        ]);

        $this->put("/admin/doctors/{$doctor->slug}", [
            'full_name' => 'Dr. Updated Name',
            'experience_years' => 5,
            'consultation_fee' => 500,
            'is_active' => 1,
        ])->assertRedirect('/admin/doctors');

        $this->assertDatabaseHas('doctors', ['id' => $doctor->id, 'full_name' => 'Dr. Updated Name']);
    }

    public function test_can_delete_doctor(): void
    {
        $doctor = Doctor::create(['full_name' => 'Dr. Delete Me', 'slug' => 'dr-delete-me', 'is_active' => true]);

        $this->delete("/admin/doctors/{$doctor->slug}")->assertRedirect('/admin/doctors');
        $this->assertDatabaseMissing('doctors', ['id' => $doctor->id]);
    }

    // ---- Departments ----

    public function test_can_create_department(): void
    {
        $this->post('/admin/departments', [
            'name' => 'Oncology', 'icon' => '🎗️', 'sort_order' => 2, 'is_active' => 1,
        ])->assertRedirect('/admin/departments');

        $this->assertDatabaseHas('departments', ['name' => 'Oncology', 'slug' => 'oncology']);
    }

    public function test_can_delete_department(): void
    {
        $dept = Department::create(['name' => 'Temp Dept', 'slug' => 'temp-dept', 'is_active' => true]);

        // Departments are slug-bound (getRouteKeyName).
        $this->delete("/admin/departments/{$dept->slug}")->assertRedirect('/admin/departments');
        $this->assertDatabaseMissing('departments', ['id' => $dept->id]);
    }

    // ---- Advertisements (with image upload) ----

    public function test_can_create_advertisement_with_image(): void
    {
        Storage::fake('public');

        $this->post('/admin/advertisements', [
            'title' => 'Promo Banner',
            'sponsor_name' => 'Acme',
            'placement' => 'mid_homepage',
            'redirect_url' => '/doctors',
            'image' => UploadedFile::fake()->image('banner.jpg', 1200, 250),
            'is_active' => 1,
            'sort_order' => 0,
        ])->assertRedirect('/admin/advertisements');

        $this->assertDatabaseHas('advertisements', ['title' => 'Promo Banner', 'placement' => 'mid_homepage']);

        $ad = Advertisement::first();
        $this->assertNotNull($ad->image);
        Storage::disk('public')->assertExists($ad->image);
    }

    public function test_advertisement_requires_image_on_create(): void
    {
        $this->post('/admin/advertisements', [
            'title' => 'No Image Ad', 'placement' => 'mid_homepage',
        ])->assertSessionHasErrors('image');
    }

    public function test_can_upload_gif_and_webp_advertisement(): void
    {
        Storage::fake('public');

        foreach (['gif', 'webp'] as $ext) {
            $this->post('/admin/advertisements', [
                'title' => "Animated {$ext} ad",
                'placement' => 'hero_bottom',
                'image' => UploadedFile::fake()->create("banner.{$ext}", 200, "image/{$ext}"),
                'is_active' => 1,
                'sort_order' => 0,
            ])->assertRedirect('/admin/advertisements')->assertSessionDoesntHaveErrors();

            $this->assertDatabaseHas('advertisements', ['title' => "Animated {$ext} ad"]);
        }
    }
}
