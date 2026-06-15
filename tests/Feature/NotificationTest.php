<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\NotificationLog;
use App\Notifications\Channels\VoiceCallNotificationChannel;
use App\Services\Notifications\AppointmentNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function appointment(): Appointment
    {
        $doctor = Doctor::create(['full_name' => 'Dr. Notify', 'slug' => 'dr-notify', 'is_active' => true]);

        return Appointment::create([
            'doctor_id' => $doctor->id,
            'patient_name' => 'Pat Notify', 'patient_phone' => '0171234567', 'patient_email' => 'pat@example.com',
            'appointment_date' => now()->addDay()->toDateString(), 'appointment_time' => '10:00',
            'status' => 'pending', 'payment_status' => 'unpaid',
        ]);
    }

    public function test_status_change_dispatches_event_and_logs(): void
    {
        $service = app(AppointmentNotificationService::class);
        $appointment = $this->appointment();

        $service->statusChanged($appointment, 'confirmed');

        $this->assertDatabaseHas('notification_logs', [
            'appointment_id' => $appointment->id,
            'event' => 'appointment_approved',
        ]);
    }

    public function test_disabled_channel_is_skipped_not_sent(): void
    {
        config()->set('notifications.events.appointment_completed', ['whatsapp']);
        config()->set('notifications.channels.whatsapp.enabled', false);

        $service = app(AppointmentNotificationService::class);
        $appointment = $this->appointment();
        $service->appointmentCompleted($appointment);

        $log = NotificationLog::where('event', 'appointment_completed')->where('channel', 'whatsapp')->first();
        $this->assertNotNull($log);
        $this->assertSame('skipped', $log->status);
    }

    public function test_voice_channel_mock_sent_when_enabled(): void
    {
        config()->set('notifications.channels.voice.enabled', true);
        config()->set('notifications.channels.voice.driver', 'mock');

        $channel = new VoiceCallNotificationChannel;
        $result = $channel->send('0170000000', 'Your appointment is confirmed.');

        $this->assertSame('mock_sent', $result->status);
        $this->assertSame('mock-voice', $result->provider);
    }

    public function test_voice_channel_pending_when_real_driver_configured_but_unimplemented(): void
    {
        config()->set('notifications.channels.voice.enabled', true);
        config()->set('notifications.channels.voice.driver', 'future-provider');

        $channel = new VoiceCallNotificationChannel;
        $result = $channel->send('0170000000', 'Reminder.');

        // Placeholder hands off to callProvider() which is not implemented yet.
        $this->assertSame('pending', $result->status);
        $this->assertSame('future-provider', $result->provider);
    }

    public function test_voice_channel_skipped_when_disabled(): void
    {
        config()->set('notifications.channels.voice.enabled', false);

        $result = (new VoiceCallNotificationChannel)->send('0170000000', 'Hi');

        $this->assertSame('skipped', $result->status);
    }
}
