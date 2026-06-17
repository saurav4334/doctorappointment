<?php

namespace App\Services\Sms;

use App\Jobs\SendSms;
use App\Models\Appointment;
use App\Models\ServiceRequest;
use App\Models\SmsLog;
use App\Models\SmsSetting;
use App\Models\SmsTemplate;

/**
 * Central SMS orchestrator: builds context, renders templates, normalizes
 * numbers, sends via NotifyBD, and logs every attempt. Never throws — SMS
 * failure must never break the appointment/booking flow.
 */
class SmsService
{
    /** Events that have editable templates. */
    public const EVENTS = [
        'appointment_requested' => 'Appointment Request Received',
        'appointment_approved' => 'Appointment Approved',
        'appointment_rejected' => 'Appointment Rejected',
        'appointment_completed' => 'Appointment Completed',
        'appointment_reminder' => 'Appointment Reminder',
        'schedule_changed' => 'Doctor Schedule Changed',
        'admin_new_appointment' => 'New Appointment Request (Admin)',
        'ambulance_request_received' => 'Ambulance Request Received',
        'hospital_booking_request' => 'Hospital Booking Request',
        'service_request_received' => 'Home Healthcare Request Received',
    ];

    /** Placeholders available to template authors. */
    public const PLACEHOLDERS = [
        'patient_name', 'doctor_name', 'hospital_name', 'appointment_date',
        'appointment_time', 'appointment_status', 'booking_id', 'phone',
        'service_name', 'site_name', 'support_phone',
    ];

    public function __construct(
        protected SmsTemplateRenderer $renderer,
        protected NotifyBdSmsProvider $provider,
    ) {}

    // ---- Phone normalization (Bangladesh) ----

    public function normalizePhone(?string $raw): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $raw);
        if ($digits === '') {
            return null;
        }
        if (str_starts_with($digits, '880') && strlen($digits) === 13) {
            return $digits;
        }
        if (str_starts_with($digits, '0') && strlen($digits) === 11) {
            return '88'.$digits;
        }
        if (str_starts_with($digits, '1') && strlen($digits) === 10) {
            return '880'.$digits;
        }

        return null;
    }

    // ---- Core send ----

    /** Create a log and (inline or queued) deliver it. Returns the log. */
    public function send(?string $to, string $message, ?string $event = null, array $meta = []): SmsLog
    {
        $log = SmsLog::create([
            'recipient_number' => $to,
            'message' => $message,
            'event_type' => $event,
            'provider' => 'notifybd',
            'status' => 'pending',
            'appointment_id' => $meta['appointment_id'] ?? null,
            'user_id' => $meta['user_id'] ?? null,
        ]);

        if (config('sms.queue')) {
            SendSms::dispatch($log->id);
        } else {
            $this->deliverLog($log->id);
        }

        return $log->refresh();
    }

    /** Deliver a pending log via the provider; records the outcome. Never throws. */
    public function deliverLog(int $logId): void
    {
        $log = SmsLog::find($logId);
        if (! $log || $log->status !== 'pending') {
            return;
        }

        try {
            $settings = SmsSetting::current();

            if (! $settings->enabled) {
                $this->mark($log, 'skipped', error: 'SMS notifications disabled');

                return;
            }
            if (! $settings->api_key || ! $settings->sender_id) {
                $this->mark($log, 'skipped', error: 'SMS provider not configured');

                return;
            }

            $normalized = $this->normalizePhone($log->recipient_number);
            if (! $normalized) {
                $this->mark($log, 'skipped', error: 'Invalid phone number');

                return;
            }
            $log->recipient_number = $normalized;

            $result = $this->provider->send($normalized, (string) $log->message, $settings);

            $this->mark(
                $log,
                $result['ok'] ? 'sent' : 'failed',
                response: $result['response'],
                error: $result['error'],
            );
        } catch (\Throwable $e) {
            report($e);
            $this->mark($log, 'failed', error: $e->getMessage());
        }
    }

    protected function mark(SmsLog $log, string $status, ?string $response = null, ?string $error = null): void
    {
        $log->update([
            'status' => $status,
            'response_body' => $response,
            'error_message' => $error,
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }

    /** Render the template for an event and send to a recipient. */
    public function sendForEvent(string $event, ?string $to, array $params, array $meta = []): ?SmsLog
    {
        $template = SmsTemplate::activeFor($event);
        if (! $template) {
            return null; // no active template → nothing to send
        }

        $message = $this->renderer->render($template->body, $params + $this->globalParams());

        return $this->send($to, $message, $event, $meta);
    }

    public function sendTest(string $to, string $message): SmsLog
    {
        return $this->send($to, $message, 'test');
    }

    // ---- Event helpers (called from controllers) ----

    public function appointmentRequested(Appointment $a): void
    {
        $params = $this->appointmentParams($a);
        $this->sendForEvent('appointment_requested', $a->patient_phone, $params, ['appointment_id' => $a->id]);

        if ($admin = SmsSetting::current()->admin_phone) {
            $this->sendForEvent('admin_new_appointment', $admin, $params, ['appointment_id' => $a->id]);
        }
    }

    public function appointmentStatusChanged(Appointment $a, string $status): void
    {
        $event = match ($status) {
            'confirmed' => 'appointment_approved',
            'cancelled' => 'appointment_rejected',
            'completed' => 'appointment_completed',
            default => null,
        };
        if ($event) {
            $this->sendForEvent($event, $a->patient_phone, $this->appointmentParams($a), ['appointment_id' => $a->id]);
        }
    }

    public function appointmentReminder(Appointment $a): void
    {
        $this->sendForEvent('appointment_reminder', $a->patient_phone, $this->appointmentParams($a), ['appointment_id' => $a->id]);
    }

    public function serviceRequestReceived(ServiceRequest $r): void
    {
        $params = [
            'patient_name' => $r->patient_name,
            'phone' => $r->phone,
            'service_name' => $r->service?->title ?? 'service',
        ];
        // Confirmation to the patient + alert to admin.
        $this->sendForEvent('service_request_received', $r->phone, $params);
        if ($admin = SmsSetting::current()->admin_phone) {
            $this->sendForEvent('service_request_received', $admin, $params);
        }
    }

    // ---- Param builders ----

    protected function appointmentParams(Appointment $a): array
    {
        $a->loadMissing('doctor:id,full_name', 'hospital:id,name');

        return [
            'patient_name' => $a->patient_name,
            'doctor_name' => $a->doctor?->full_name ?? 'the doctor',
            'hospital_name' => $a->hospital?->name ?? ($a->doctor?->hospital_name ?? ''),
            'appointment_date' => optional($a->appointment_date)->format('d M Y') ?? (string) $a->appointment_date,
            'appointment_time' => \Illuminate\Support\Str::substr((string) $a->appointment_time, 0, 5),
            'appointment_status' => ucfirst($a->status),
            'booking_id' => $a->id,
            'phone' => $a->patient_phone,
        ];
    }

    protected function globalParams(): array
    {
        return [
            'site_name' => config('app.name'),
            'support_phone' => config('site.support.doctor_phone'),
        ];
    }
}
