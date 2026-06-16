<?php

namespace App\Http\Controllers;

use App\Models\Hospital;

class HospitalController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $city = trim((string) $request->query('city', ''));

        $hospitals = Hospital::active()
            ->when($city !== '', fn ($q) => $q->where('city', $city))
            ->withCount(['doctors' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return view('hospitals.index', compact('hospitals'));
    }

    public function show(Hospital $hospital)
    {
        abort_unless($hospital->is_active, 404);

        $doctors = $hospital->doctors()
            ->where('is_active', true)
            ->with(['schedules' => fn ($q) => $q->where('is_active', true)])
            ->orderByDesc('is_featured')
            ->orderByDesc('rating')
            ->get();

        return view('hospitals.show', compact('hospital', 'doctors'));
    }
}
