<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesImageUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\DoctorRequest;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\Hospital;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DoctorController extends Controller
{
    use HandlesImageUpload;

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');

        $doctors = Doctor::query()
            ->with('hospital:id,name')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('full_name', 'like', "%{$search}%")
                ->orWhere('specializations', 'like', "%{$search}%")))
            ->when($status !== '', fn ($q) => $q->where('is_active', (int) $status))
            ->orderByDesc('is_featured')
            ->orderByDesc('featured_priority')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return view('admin.doctors.index', compact('doctors', 'search', 'status'));
    }

    public function create()
    {
        return view('admin.doctors.create', [
            'doctor' => new Doctor(['is_active' => true]),
            'departments' => Department::orderBy('name')->get(),
            'hospitals' => Hospital::orderBy('name')->get(),
        ]);
    }

    public function store(DoctorRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['full_name']);
        $data['photo'] = $this->storeImage($request->file('photo'), 'doctors');

        Doctor::create($data);

        return redirect()->route('admin.doctors.index')->with('success', 'Doctor created successfully.');
    }

    public function edit(Doctor $doctor)
    {
        $doctor->load(['schedules' => fn ($q) => $q->orderBy('day_of_week'), 'schedules.hospital:id,name']);

        return view('admin.doctors.edit', [
            'doctor' => $doctor,
            'departments' => Department::orderBy('name')->get(),
            'hospitals' => Hospital::orderBy('name')->get(),
        ]);
    }

    public function update(DoctorRequest $request, Doctor $doctor)
    {
        $data = $request->validated();
        $data['photo'] = $this->storeImage($request->file('photo'), 'doctors', $doctor->photo);

        $doctor->update($data);

        return redirect()->route('admin.doctors.index')->with('success', 'Doctor updated successfully.');
    }

    public function destroy(Doctor $doctor)
    {
        $this->deleteImage($doctor->photo);
        $doctor->delete();

        return redirect()->route('admin.doctors.index')->with('success', 'Doctor deleted.');
    }

    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (Doctor::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }
}
