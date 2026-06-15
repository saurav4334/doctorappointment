<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\NotificationLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    protected Doctor $doctor;
    protected string $date;
    protected string $time = '09:00';

    protected function setUp(): void
    {
        parent::setUp();

        // A date one week out (avoids "today / past time" edge cases).
        $target = Carbon::now()->addWeek()->startOfDay();
        $this->date = $target->toDateString();

        $this->doctor = Doctor::create([
            'full_name' => 'Dr. Booking Test', 'slug' => 'dr-booking-test', 'is_active' => true,
            'consultation_fee' => 600,
        ]);

        // Schedule on the same weekday as the target date.
        DoctorSchedule::create([
            'doctor_id' => $this->doctor->id,
            'day_of_week' => $target->dayOfWeek,
            'start_time' => '09:00',
            'end_time' => '12:00',
            'slot_duration' => 30,
            'max_appointments' => 1,
            'is_active' => true,
        ]);
    }

    protected function payload(array $overrides = []): array
    {
        return array_merge([
            'appointment_date' => $this->date,
            'appointment_time' => $this->time,
            'patient_name' => 'John Patient',
            'patient_phone' => '+8801700000000',
            'patient_email' => 'john@example.com',
            'notes' => 'Chest pain',
        ], $overrides);
    }

    public function test_slots_endpoint_returns_available_times(): void
    {
        $this->getJson(route('booking.slots', $this->doctor->slug)."?date={$this->date}")
            ->assertOk()
            ->assertJsonFragment(['value' => '09:00', 'available' => true]);
    }

    public function test_successful_booking_creates_appointment(): void
    {
        $this->post(route('booking.store', $this->doctor->slug), $this->payload())
            ->assertRedirect(route('doctors.show', $this->doctor->slug).'#booking')
            ->assertSessionHas('booking_success');

        $this->assertDatabaseHas('appointments', [
            'doctor_id' => $this->doctor->id,
            'patient_name' => 'John Patient',
            'appointment_time' => $this->time,
            'status' => 'pending',
        ]);
    }

    public function test_booking_creates_notification_logs(): void
    {
        $this->post(route('booking.store', $this->doctor->slug), $this->payload());

        // appointment_requested fires sms + email (both enabled by default → mock_sent).
        $this->assertDatabaseHas('notification_logs', [
            'event' => 'appointment_requested',
            'channel' => 'sms',
            'status' => 'mock_sent',
        ]);
        $this->assertTrue(
            NotificationLog::where('event', 'appointment_requested')->count() >= 1
        );
    }

    public function test_double_booking_is_prevented(): void
    {
        // Fill the single-capacity slot.
        Appointment::create([
            'doctor_id' => $this->doctor->id,
            'patient_name' => 'First Patient', 'patient_phone' => '0170000001',
            'appointment_date' => $this->date, 'appointment_time' => $this->time,
            'status' => 'pending', 'payment_status' => 'unpaid',
        ]);

        $this->post(route('booking.store', $this->doctor->slug), $this->payload())
            ->assertSessionHasErrors('appointment_time');

        $this->assertSame(1, Appointment::where('appointment_time', $this->time)->count());
    }

    public function test_booking_outside_schedule_is_rejected(): void
    {
        // A date on a different weekday than the doctor's only schedule.
        $otherDay = Carbon::parse($this->date)->addDay()->toDateString();

        $this->post(route('booking.store', $this->doctor->slug), $this->payload([
            'appointment_date' => $otherDay,
        ]))->assertSessionHasErrors('appointment_time');

        $this->assertSame(0, Appointment::count());
    }

    public function test_past_date_booking_is_rejected_by_validation(): void
    {
        $this->post(route('booking.store', $this->doctor->slug), $this->payload([
            'appointment_date' => Carbon::yesterday()->toDateString(),
        ]))->assertSessionHasErrors('appointment_date');
    }

    public function test_invalid_name_and_phone_are_rejected(): void
    {
        $this->post(route('booking.store', $this->doctor->slug), $this->payload([
            'patient_name' => '12345',
            'patient_phone' => 'abc',
        ]))->assertSessionHasErrors(['patient_name', 'patient_phone']);
    }
}
