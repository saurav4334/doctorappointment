<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppointmentRequest;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Hospital;
use App\Services\Notifications\AppointmentNotificationService;
use App\Services\Sms\SmsService;
use App\Services\VoiceCall\VoiceCallService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    public const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

    public function __construct(
        protected AppointmentNotificationService $notifications,
        protected SmsService $sms,
        protected VoiceCallService $voice,
    ) {}

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');
        $doctorId = $request->query('doctor_id', '');
        $hospitalId = $request->query('hospital_id', '');
        $date = $request->query('date', '');

        $appointments = Appointment::query()
            ->with('doctor:id,full_name')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('patient_name', 'like', "%{$search}%")
                ->orWhere('patient_phone', 'like', "%{$search}%")))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->when($doctorId !== '', fn ($q) => $q->where('doctor_id', $doctorId))
            ->when($hospitalId !== '', fn ($q) => $q->where('hospital_id', $hospitalId))
            ->when($date !== '', fn ($q) => $q->whereDate('appointment_date', $date))
            ->latest('appointment_date')
            ->paginate(12)
            ->withQueryString();

        $statusOptions = ['' => 'All Status'] + array_combine(
            self::STATUSES,
            array_map('ucfirst', self::STATUSES)
        );

        return view('admin.appointments.index', [
            'appointments' => $appointments,
            'search' => $search,
            'status' => $status,
            'statusOptions' => $statusOptions,
            'doctorId' => $doctorId,
            'hospitalId' => $hospitalId,
            'date' => $date,
            'doctors' => Doctor::orderBy('full_name')->get(['id', 'full_name']),
            'hospitals' => Hospital::orderBy('name')->get(['id', 'name']),
        ]);
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
        $appointment = Appointment::create($request->validated());
        $this->notifications->appointmentRequested($appointment);

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
        $previousStatus = $appointment->status;
        $appointment->update($request->validated());

        if ($appointment->status !== $previousStatus) {
            $this->notifications->statusChanged($appointment, $appointment->status);
            $this->sms->appointmentStatusChanged($appointment, $appointment->status);
            $this->voice->appointmentStatusChanged($appointment, $appointment->status);
        }

        return redirect()->route('admin.appointments.index')->with('success', 'Appointment updated.');
    }

    /** Quick approve / reject / complete from the list, with notification. */
    public function setStatus(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
        ]);

        if ($appointment->status !== $data['status']) {
            $appointment->update(['status' => $data['status']]);
            $this->notifications->statusChanged($appointment, $data['status']);
            $this->sms->appointmentStatusChanged($appointment, $data['status']);
            $this->voice->appointmentStatusChanged($appointment, $data['status']);
        }

        return back()->with('success', 'Appointment marked as '.$data['status'].'.');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->route('admin.appointments.index')->with('success', 'Appointment deleted.');
    }
}
