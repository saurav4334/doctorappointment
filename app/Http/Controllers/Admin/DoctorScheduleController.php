<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DoctorScheduleController extends Controller
{
    public function store(Request $request, Doctor $doctor)
    {
        $data = $request->validate([
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'hospital_id' => ['nullable', 'exists:hospitals,id'],
            'slot_duration' => ['nullable', 'integer', 'min:5', 'max:240'],
        ]);

        $doctor->schedules()->create([
            ...$data,
            'slot_duration' => $data['slot_duration'] ?? 30,
            'is_active' => true,
        ]);

        return back()->with('success', 'Schedule slot added.');
    }

    public function destroy(Doctor $doctor, DoctorSchedule $schedule)
    {
        abort_unless($schedule->doctor_id === $doctor->id, 404);
        $schedule->delete();

        return back()->with('success', 'Schedule slot removed.');
    }
}
