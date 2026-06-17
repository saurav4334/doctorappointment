<?php

namespace App\Http\Controllers;

use App\Http\Requests\BookingRequest;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Services\Notifications\AppointmentNotificationService;
use App\Services\Scheduling\SlotService;
use App\Services\Sms\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function __construct(
        protected SlotService $slots,
        protected AppointmentNotificationService $notifications,
        protected SmsService $sms,
    ) {}

    /** AJAX: available slots for a doctor on a date. */
    public function slots(Request $request, Doctor $doctor)
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
        ]);

        abort_unless($doctor->is_active, 404);

        return response()->json([
            'date' => $data['date'],
            'slots' => $this->slots->availableSlots($doctor, $data['date'])->values(),
        ]);
    }

    public function store(BookingRequest $request, Doctor $doctor)
    {
        abort_unless($doctor->is_active, 404);

        $data = $request->validated();
        $date = $data['appointment_date'];
        $time = substr($data['appointment_time'], 0, 5);

        $this->assertSlotIsBookable($doctor, $date, $time);

        try {
            $appointment = DB::transaction(function () use ($doctor, $date, $time, $data) {
                $capacity = $this->slots->capacityFor($doctor, $date, $time);

                // Lock the slot's rows so concurrent requests can't oversell capacity.
                $booked = Appointment::where('doctor_id', $doctor->id)
                    ->whereDate('appointment_date', $date)
                    ->whereIn('appointment_time', [$time, $time.':00'])
                    ->whereIn('status', SlotService::ACTIVE_STATUSES)
                    ->lockForUpdate()
                    ->count();

                if ($booked >= $capacity) {
                    throw ValidationException::withMessages([
                        'appointment_time' => 'Sorry, this slot was just filled. Please choose another time.',
                    ]);
                }

                return Appointment::create([
                    'doctor_id' => $doctor->id,
                    'hospital_id' => $doctor->hospital_id,
                    'patient_name' => $data['patient_name'],
                    'patient_phone' => $data['patient_phone'],
                    'patient_email' => $data['patient_email'] ?? null,
                    'appointment_date' => $date,
                    'appointment_time' => $time,
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                    'notes' => $data['notes'] ?? null,
                ]);
            });
        } catch (ValidationException $e) {
            throw $e;
        }

        $this->notifications->appointmentRequested($appointment);
        $this->sms->appointmentRequested($appointment);

        return redirect()
            ->route('doctors.show', $doctor->slug)
            ->with('booking_success', 'Your appointment request has been received! We will confirm it shortly.')
            ->withFragment('booking');
    }

    /** Reject bookings that fall outside a schedule, on off-days, or in the past. */
    protected function assertSlotIsBookable(Doctor $doctor, string $date, string $time): void
    {
        if ($this->slots->capacityFor($doctor, $date, $time) < 1) {
            throw ValidationException::withMessages([
                'appointment_time' => 'The selected time is not available for this doctor.',
            ]);
        }

        if ($doctor->offDays()->whereDate('date', $date)->exists()) {
            throw ValidationException::withMessages([
                'appointment_date' => 'The doctor is unavailable on the selected date.',
            ]);
        }

        $slotMoment = Carbon::parse($date.' '.$time);
        if ($slotMoment->lte(now())) {
            throw ValidationException::withMessages([
                'appointment_time' => 'You cannot book a time that has already passed.',
            ]);
        }
    }
}
