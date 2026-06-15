<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Hospital;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'doctors' => Doctor::count(),
            'hospitals' => Hospital::count(),
            'appointments' => Appointment::count(),
            'pending' => Appointment::where('status', 'pending')->count(),
            'featured' => Doctor::where('is_featured', true)->count(),
        ];

        $recentAppointments = Appointment::with('doctor:id,full_name')
            ->latest()
            ->limit(8)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentAppointments'));
    }
}
