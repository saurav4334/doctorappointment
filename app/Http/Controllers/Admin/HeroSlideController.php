<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesImageUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\HeroSlideRequest;
use App\Models\HeroSlide;
use Illuminate\Http\Request;

class HeroSlideController extends Controller
{
    use HandlesImageUpload;

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');

        $heroSlides = HeroSlide::query()
            ->when($search !== '', fn ($q) => $q->where('title', 'like', "%{$search}%"))
            ->when($status !== '', fn ($q) => $q->where('is_active', (int) $status))
            ->orderBy('sort_order')
            ->paginate(10)
            ->withQueryString();

        return view('admin.hero-slides.index', compact('heroSlides', 'search', 'status'));
    }

    public function create()
    {
        return view('admin.hero-slides.create', ['heroSlide' => new HeroSlide(['is_active' => true])]);
    }

    public function store(HeroSlideRequest $request)
    {
        $data = $request->validated();

        try {
            $data['image'] = $this->storeImage($request->file('image'), 'hero-slides');
        } catch (\Throwable $e) {
            report($e);

            return back()->withInput()->with('error', 'The image could not be uploaded. Please try a JPG, PNG, WebP or GIF under 5MB.');
        }

        HeroSlide::create($data);

        return redirect()->route('admin.hero-slides.index')->with('success', 'Hero slide created.');
    }

    public function edit(HeroSlide $heroSlide)
    {
        return view('admin.hero-slides.edit', compact('heroSlide'));
    }

    public function update(HeroSlideRequest $request, HeroSlide $heroSlide)
    {
        $data = $request->validated();

        try {
            // Existing image is kept if no new file; old file is deleted only
            // after the new one is stored successfully (see HandlesImageUpload).
            $data['image'] = $this->storeImage($request->file('image'), 'hero-slides', $heroSlide->image);
        } catch (\Throwable $e) {
            report($e);

            return back()->withInput()->with('error', 'The image could not be uploaded. Your existing slide image was kept. Please try a JPG, PNG, WebP or GIF under 5MB.');
        }

        $heroSlide->update($data);

        return redirect()->route('admin.hero-slides.index')->with('success', 'Hero slide updated.');
    }

    public function destroy(HeroSlide $heroSlide)
    {
        $this->deleteImage($heroSlide->image);
        $heroSlide->delete();

        return redirect()->route('admin.hero-slides.index')->with('success', 'Hero slide deleted.');
    }
}
