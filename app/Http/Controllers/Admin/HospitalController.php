<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesImageUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\HospitalRequest;
use App\Models\Hospital;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HospitalController extends Controller
{
    use HandlesImageUpload;

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');

        $hospitals = Hospital::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$search}%")
                ->orWhere('city', 'like', "%{$search}%")))
            ->when($status !== '', fn ($q) => $q->where('is_active', (int) $status))
            ->withCount('doctors')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return view('admin.hospitals.index', compact('hospitals', 'search', 'status'));
    }

    public function create()
    {
        return view('admin.hospitals.create', ['hospital' => new Hospital(['is_active' => true])]);
    }

    public function store(HospitalRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['image'] = $this->storeImage($request->file('image'), 'hospitals');

        Hospital::create($data);

        return redirect()->route('admin.hospitals.index')->with('success', 'Hospital created.');
    }

    public function edit(Hospital $hospital)
    {
        return view('admin.hospitals.edit', compact('hospital'));
    }

    public function update(HospitalRequest $request, Hospital $hospital)
    {
        $data = $request->validated();
        $data['image'] = $this->storeImage($request->file('image'), 'hospitals', $hospital->image);

        $hospital->update($data);

        return redirect()->route('admin.hospitals.index')->with('success', 'Hospital updated.');
    }

    public function destroy(Hospital $hospital)
    {
        $this->deleteImage($hospital->image);
        $hospital->delete();

        return redirect()->route('admin.hospitals.index')->with('success', 'Hospital deleted.');
    }

    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (Hospital::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }
}
