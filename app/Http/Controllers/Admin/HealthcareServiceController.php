<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesImageUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\HealthcareServiceRequest;
use App\Models\HomeService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HealthcareServiceController extends Controller
{
    use HandlesImageUpload;

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');

        $services = HomeService::query()
            ->when($search !== '', fn ($q) => $q->where('title', 'like', "%{$search}%"))
            ->when($status !== '', fn ($q) => $q->where('is_active', (int) $status))
            ->orderBy('sort_order')
            ->paginate(10)
            ->withQueryString();

        return view('admin.healthcare-services.index', compact('services', 'search', 'status'));
    }

    public function create()
    {
        return view('admin.healthcare-services.create', ['service' => new HomeService(['is_active' => true])]);
    }

    public function store(HealthcareServiceRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['title']);
        $data['image'] = $this->storeImage($request->file('image'), 'services');

        HomeService::create($data);

        return redirect()->route('admin.healthcare-services.index')->with('success', 'Service created.');
    }

    public function edit(HomeService $service)
    {
        return view('admin.healthcare-services.edit', compact('service'));
    }

    public function update(HealthcareServiceRequest $request, HomeService $service)
    {
        $data = $request->validated();
        $data['image'] = $this->storeImage($request->file('image'), 'services', $service->image);

        $service->update($data);

        return redirect()->route('admin.healthcare-services.index')->with('success', 'Service updated.');
    }

    public function destroy(HomeService $service)
    {
        $this->deleteImage($service->image);
        $service->delete();

        return redirect()->route('admin.healthcare-services.index')->with('success', 'Service deleted.');
    }

    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (HomeService::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }
}
