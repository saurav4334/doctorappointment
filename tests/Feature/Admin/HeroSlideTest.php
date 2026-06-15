<?php

namespace Tests\Feature\Admin;

use App\Models\HeroSlide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HeroSlideTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs($this->userWithRole('super_admin'));
        Storage::fake('public');
    }

    protected function slideWithImage(): HeroSlide
    {
        Storage::disk('public')->put('hero-slides/old.jpg', 'old-bytes');

        return HeroSlide::create([
            'title' => 'Original', 'image' => 'hero-slides/old.jpg', 'sort_order' => 0, 'is_active' => true,
        ]);
    }

    protected function update(HeroSlide $slide, array $data)
    {
        return $this->put(route('admin.hero-slides.update', $slide), array_merge([
            'title' => $slide->title, 'sort_order' => 0, 'is_active' => 1,
        ], $data));
    }

    public function test_update_without_new_image_keeps_existing(): void
    {
        $slide = $this->slideWithImage();

        $this->update($slide, ['title' => 'Renamed'])
            ->assertRedirect(route('admin.hero-slides.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('hero_slides', ['id' => $slide->id, 'title' => 'Renamed', 'image' => 'hero-slides/old.jpg']);
        Storage::disk('public')->assertExists('hero-slides/old.jpg');
    }

    public function test_update_with_jpg_replaces_image_and_deletes_old(): void
    {
        $slide = $this->slideWithImage();

        $this->update($slide, ['image' => UploadedFile::fake()->image('new.jpg', 1200, 240)])
            ->assertRedirect(route('admin.hero-slides.index'))
            ->assertSessionHasNoErrors();

        $slide->refresh();
        $this->assertNotSame('hero-slides/old.jpg', $slide->image);
        Storage::disk('public')->assertExists($slide->image);
        Storage::disk('public')->assertMissing('hero-slides/old.jpg'); // old removed after success
    }

    public function test_update_with_webp_is_accepted(): void
    {
        $slide = $this->slideWithImage();

        $this->update($slide, ['image' => UploadedFile::fake()->create('banner.webp', 300, 'image/webp')])
            ->assertRedirect()->assertSessionHasNoErrors();

        $slide->refresh();
        $this->assertStringEndsWith('.webp', $slide->image);
        Storage::disk('public')->assertExists($slide->image);
    }

    public function test_update_with_gif_is_accepted(): void
    {
        $slide = $this->slideWithImage();

        $this->update($slide, ['image' => UploadedFile::fake()->create('anim.gif', 300, 'image/gif')])
            ->assertRedirect()->assertSessionHasNoErrors();

        $slide->refresh();
        $this->assertStringEndsWith('.gif', $slide->image);
        Storage::disk('public')->assertExists($slide->image);
    }

    public function test_invalid_file_type_is_rejected_and_old_image_kept(): void
    {
        $slide = $this->slideWithImage();

        $this->update($slide, ['image' => UploadedFile::fake()->create('malware.pdf', 100, 'application/pdf')])
            ->assertSessionHasErrors('image');

        // Old image untouched in DB and on disk.
        $this->assertDatabaseHas('hero_slides', ['id' => $slide->id, 'image' => 'hero-slides/old.jpg']);
        Storage::disk('public')->assertExists('hero-slides/old.jpg');
    }

    public function test_oversized_file_is_rejected(): void
    {
        $slide = $this->slideWithImage();

        $this->update($slide, ['image' => UploadedFile::fake()->create('big.jpg', 6000, 'image/jpeg')])
            ->assertSessionHasErrors('image');

        Storage::disk('public')->assertExists('hero-slides/old.jpg');
    }
}
