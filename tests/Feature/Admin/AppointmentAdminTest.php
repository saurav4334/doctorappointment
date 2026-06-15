<?php

namespace Tests\Feature\Admin;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs($this->userWithRole('super_admin'));
    }

    protected function appointment(string $status = 'pending'): Appointment
    {
        $doctor = Doctor::create(['full_name' => 'Dr. Admin Appt', 'slug' => 'dr-admin-appt', 'is_active' => true]);

        return Appointment::create([
            'doctor_id' => $doctor->id,
            'patient_name' => 'Admin Patient', 'patient_phone' => '0170000000', 'patient_email' => 'a@b.com',
            'appointment_date' => now()->addDay()->toDateString(), 'appointment_time' => '11:00',
            'status' => $status, 'payment_status' => 'unpaid',
        ]);
    }

    public function test_admin_can_approve_appointment_and_notification_is_logged(): void
    {
        $appointment = $this->appointment('pending');

        $this->patch(route('admin.appointments.set-status', $appointment), ['status' => 'confirmed'])
            ->assertRedirect();

        $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'confirmed']);
        $this->assertDatabaseHas('notification_logs', [
            'appointment_id' => $appointment->id,
            'event' => 'appointment_approved',
        ]);
    }

    public function test_admin_can_reject_appointment(): void
    {
        $appointment = $this->appointment('pending');

        $this->patch(route('admin.appointments.set-status', $appointment), ['status' => 'cancelled'])
            ->assertRedirect();

        $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'cancelled']);
        $this->assertDatabaseHas('notification_logs', ['event' => 'appointment_rejected']);
    }

    public function test_admin_can_save_internal_notes(): void
    {
        $appointment = $this->appointment('pending');

        $this->put(route('admin.appointments.update', $appointment), [
            'doctor_id' => $appointment->doctor_id,
            'patient_name' => $appointment->patient_name,
            'patient_phone' => $appointment->patient_phone,
            'appointment_date' => $appointment->appointment_date->toDateString(),
            'appointment_time' => '11:00',
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'admin_notes' => 'Patient called to confirm.',
        ])->assertRedirect(route('admin.appointments.index'));

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'admin_notes' => 'Patient called to confirm.',
            'payment_status' => 'paid',
        ]);
    }
}
