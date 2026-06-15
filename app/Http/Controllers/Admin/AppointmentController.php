<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppointmentRequest;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Hospital;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');

        $appointments = Appointment::query()
            ->with('doctor:id,full_name')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('patient_name', 'like', "%{$search}%")
                ->orWhere('patient_phone', 'like', "%{$search}%")))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->latest('appointment_date')
            ->paginate(12)
            ->withQueryString();

        $statusOptions = ['' => 'All Status'] + array_combine(
            self::STATUSES,
            array_map('ucfirst', self::STATUSES)
        );

        return view('admin.appointments.index', compact('appointments', 'search', 'status', 'statusOptions'));
    }

    public function create()
    {
        return view('admin.appointments.create', [
            'appointment' => new Appointment(['status' => 'pending', 'payment_status' => 'unpaid']),
            'doctors' => Doctor::orderBy('full_name')->get(['id', 'full_name']),
            'hospitals' => Hospital::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(AppointmentRequest $request)
    {
        Appointment::create($request->validated());

        return redirect()->route('admin.appointments.index')->with('success', 'Appointment created.');
    }

    public function edit(Appointment $appointment)
    {
        return view('admin.appointments.edit', [
            'appointment' => $appointment,
            'doctors' => Doctor::orderBy('full_name')->get(['id', 'full_name']),
            'hospitals' => Hospital::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(AppointmentRequest $request, Appointment $appointment)
    {
        $appointment->update($request->validated());

        return redirect()->route('admin.appointments.index')->with('success', 'Appointment updated.');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->route('admin.appointments.index')->with('success', 'Appointment deleted.');
    }
}
