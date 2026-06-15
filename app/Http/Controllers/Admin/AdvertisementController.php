<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesImageUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdvertisementRequest;
use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    use HandlesImageUpload;

    public const PLACEMENTS = [
        'hero_bottom' => 'Hero Bottom (1920×300)',
        'mid_homepage' => 'Mid Homepage (1200×250)',
        'sidebar' => 'Sidebar (300×600)',
        'footer_banner' => 'Footer Banner (1200×250)',
    ];

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');

        $advertisements = Advertisement::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('title', 'like', "%{$search}%")
                ->orWhere('sponsor_name', 'like', "%{$search}%")))
            ->when($status !== '', fn ($q) => $q->where('is_active', (int) $status))
            ->orderBy('placement')
            ->orderBy('sort_order')
            ->paginate(10)
            ->withQueryString();

        return view('admin.advertisements.index', compact('advertisements', 'search', 'status'));
    }

    public function create()
    {
        return view('admin.advertisements.create', [
            'advertisement' => new Advertisement(['is_active' => true, 'placement' => 'mid_homepage']),
            'placements' => self::PLACEMENTS,
        ]);
    }

    public function store(AdvertisementRequest $request)
    {
        $data = $request->validated();
        $data['image'] = $this->storeImage($request->file('image'), 'ads');

        Advertisement::create($data);

        return redirect()->route('admin.advertisements.index')->with('success', 'Advertisement created.');
    }

    public function edit(Advertisement $advertisement)
    {
        return view('admin.advertisements.edit', [
            'advertisement' => $advertisement,
            'placements' => self::PLACEMENTS,
        ]);
    }

    public function update(AdvertisementRequest $request, Advertisement $advertisement)
    {
        $data = $request->validated();
        $data['image'] = $this->storeImage($request->file('image'), 'ads', $advertisement->image);

        $advertisement->update($data);

        return redirect()->route('admin.advertisements.index')->with('success', 'Advertisement updated.');
    }

    public function destroy(Advertisement $advertisement)
    {
        $this->deleteImage($advertisement->image);
        $advertisement->delete();

        return redirect()->route('admin.advertisements.index')->with('success', 'Advertisement deleted.');
    }
}
