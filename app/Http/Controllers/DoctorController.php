<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $departmentSlug = $request->query('department');
        $city = trim((string) $request->query('city', ''));
        $sort = $request->query('sort', 'rating');

        $query = Doctor::active()->with('hospital:id,name,city');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('specializations', 'like', "%{$search}%");
            });
        }

        if ($departmentSlug) {
            $query->whereHas('department', fn ($q) => $q->where('slug', $departmentSlug));
        }

        // City filter (via the doctor's hospital) — used by the hero search panel.
        if ($city !== '') {
            $query->whereHas('hospital', fn ($q) => $q->where('city', $city));
        }

        match ($sort) {
            'experience' => $query->orderByDesc('experience_years'),
            'fee-low'    => $query->orderBy('consultation_fee'),
            'fee-high'   => $query->orderByDesc('consultation_fee'),
            default      => $query->orderByDesc('rating'),
        };

        $doctors = $query->paginate(9)->withQueryString();

        $departments = Department::active()->orderBy('name')->get(['name', 'slug']);

        return view('doctors.index', compact('doctors', 'departments', 'search', 'departmentSlug', 'sort'));
    }

    public function show(Doctor $doctor)
    {
        abort_unless($doctor->is_active, 404);

        $doctor->load([
            'hospital',
            'department',
            'schedules' => fn ($q) => $q->where('is_active', true)->orderBy('day_of_week'),
            'schedules.hospital:id,name',
        ]);

        return view('doctors.show', compact('doctor'));
    }
}
