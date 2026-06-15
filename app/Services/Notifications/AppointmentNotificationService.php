<?php

namespace App\Services\Notifications;

use App\Jobs\SendNotification;
use App\Models\Appointment;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Notifications\Channels\EmailNotificationChannel;
use App\Notifications\Channels\SmsNotificationChannel;
use App\Notifications\Channels\VoiceCallNotificationChannel;
use App\Notifications\Channels\WhatsAppNotificationChannel;
use App\Notifications\Contracts\NotificationChannel;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * The single entry point appointment logic uses to notify people. It records a
 * NotificationLog per (event, channel, recipient) and dispatches delivery via a
 * swappable channel. No appointment code references a concrete provider.
 */
class AppointmentNotificationService
{
    /** Channel key → implementation. Add a provider here, nowhere else. */
    protected array $channels = [
        'sms' => SmsNotificationChannel::class,
        'email' => EmailNotificationChannel::class,
        'whatsapp' => WhatsAppNotificationChannel::class,
        'voice' => VoiceCallNotificationChannel::class,
    ];

    // ---- Public event API (called from controllers / commands) ----

    public function appointmentRequested(Appointment $a): void
    {
        $this->dispatch('appointment_requested', $a);
    }

    public function appointmentApproved(Appointment $a): void
    {
        $this->dispatch('appointment_approved', $a);
    }

    public function appointmentRejected(Appointment $a): void
    {
        $this->dispatch('appointment_rejected', $a);
    }

    public function appointmentCompleted(Appointment $a): void
    {
        $this->dispatch('appointment_completed', $a);
    }

    public function appointmentReminder(Appointment $a): void
    {
        $this->dispatch('appointment_reminder', $a);
    }

    /** Map an appointment status to its event and notify (no-op for unknown status). */
    public function statusChanged(Appointment $a, string $status): void
    {
        match ($status) {
            'confirmed' => $this->appointmentApproved($a),
            'cancelled' => $this->appointmentRejected($a),
            'completed' => $this->appointmentCompleted($a),
            default => null,
        };
    }

    // ---- Core ----

    public function dispatch(string $event, Appointment $appointment): void
    {
        $channels = (array) config("notifications.events.{$event}", []);
        $context = $this->context($appointment);

        foreach ($channels as $key) {
            if (! isset($this->channels[$key])) {
                continue;
            }

            $template = NotificationTemplate::for($event, $key);
            $body = $this->render($template?->body ?? $this->defaultBody($event), $context);
            $subject = $template?->subject ? $this->render($template->subject, $context) : null;

            $log = NotificationLog::create([
                'appointment_id' => $appointment->id,
                'event' => $event,
                'channel' => $key,
                'recipient' => $this->recipientFor($key, $appointment),
                'subject' => $subject,
                'body' => $body,
                'payload' => $context,
                'status' => 'pending',
            ]);

            if (config('notifications.queue')) {
                SendNotification::dispatch($log->id);
            } else {
                $this->deliverLog($log->id); // inline — works without a queue worker
            }
        }
    }

    /** Deliver a single pending log through its channel and record the result. */
    public function deliverLog(int $logId): void
    {
        $log = NotificationLog::find($logId);
        if (! $log || $log->status !== 'pending') {
            return;
        }

        /** @var NotificationChannel $channel */
        $channel = app($this->channels[$log->channel]);
        $result = $channel->send((string) $log->recipient, (string) $log->body, $log->payload ?? []);

        $log->update([
            'status' => $result->status,
            'provider' => $result->provider,
            'error' => $result->error,
            'sent_at' => $result->delivered() ? now() : null,
        ]);
    }

    // ---- Helpers ----

    protected function recipientFor(string $channel, Appointment $a): ?string
    {
        return $channel === 'email' ? $a->patient_email : $a->patient_phone;
    }

    protected function context(Appointment $a): array
    {
        $a->loadMissing('doctor:id,full_name', 'hospital:id,name');

        return [
            'patient_name' => $a->patient_name,
            'doctor_name' => $a->doctor?->full_name ?? 'the doctor',
            'hospital' => $a->hospital?->name ?? ($a->doctor?->hospital_name ?? ''),
            'date' => optional($a->appointment_date)->format('d M Y') ?? (string) $a->appointment_date,
            'time' => Str::substr((string) $a->appointment_time, 0, 5),
            'status' => $a->status,
            'clinic' => config('notifications.clinic_name'),
        ];
    }

    protected function render(string $template, array $context): string
    {
        foreach ($context as $key => $value) {
            $template = str_replace('{{'.$key.'}}', (string) $value, $template);
        }

        return $template;
    }

    protected function defaultBody(string $event): string
    {
        return match ($event) {
            'appointment_requested' => 'Hi {{patient_name}}, your appointment request with {{doctor_name}} on {{date}} at {{time}} has been received.',
            'appointment_approved' => 'Hi {{patient_name}}, your appointment with {{doctor_name}} on {{date}} at {{time}} is CONFIRMED.',
            'appointment_rejected' => 'Hi {{patient_name}}, sorry — your appointment with {{doctor_name}} on {{date}} could not be confirmed.',
            'appointment_completed' => 'Hi {{patient_name}}, thank you for visiting {{doctor_name}}. We wish you good health.',
            'appointment_reminder' => 'Reminder: your appointment with {{doctor_name}} is on {{date}} at {{time}}.',
            'schedule_changed' => 'Schedule update for {{doctor_name}} at {{clinic}}.',
            default => '{{clinic}} notification.',
        };
    }

    /** @return string[] all known channel keys (for tests/admin). */
    public function channelKeys(): array
    {
        return array_keys($this->channels);
    }
}
