<?php

namespace App\Services\VoiceCall;

use App\Jobs\SendVoiceCall;
use App\Models\Appointment;
use App\Models\VoiceCallLog;
use App\Models\VoiceCallSetting;
use App\Models\VoiceCallTemplate;

/**
 * Orchestrates automated voice calls via Protiddhoni: builds the payload from an
 * editable template, places the call, and logs the outcome. Never throws — a
 * voice-call failure must never break appointment approval.
 */
class VoiceCallService
{
    public const EVENTS = [
        'appointment_approved' => 'Appointment Approved / Confirmed',
        'appointment_reminder' => 'Appointment Reminder',
        'appointment_cancelled' => 'Appointment Cancelled',
        'ambulance_request_received' => 'Ambulance Request Received',
        'service_request_confirmed' => 'Home Service Request Confirmed',
    ];

    public const PLACEHOLDERS = [
        'patient_name', 'doctor_name', 'hospital_name', 'appointment_date',
        'appointment_time', 'booking_id', 'support_phone', 'site_name',
    ];

    public function __construct(
        protected VoiceTemplateRenderer $renderer,
        protected ProtiddhoniVoiceProvider $provider,
    ) {}

    /** Protiddhoni expects local BD format: 01XXXXXXXXX. */
    public function formatPhone(?string $raw): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $raw);
        if ($digits === '') {
            return null;
        }
        if (str_starts_with($digits, '880') && strlen($digits) === 13) {
            $digits = substr($digits, 2); // 8801... → 01...
        } elseif (str_starts_with($digits, '1') && strlen($digits) === 10) {
            $digits = '0'.$digits;        // 1XXXXXXXXX → 01XXXXXXXXX
        }

        return (str_starts_with($digits, '01') && strlen($digits) === 11) ? $digits : null;
    }

    /** Map an appointment status to a voice event and place the call. */
    public function appointmentStatusChanged(Appointment $appointment, string $status): void
    {
        $event = match ($status) {
            'confirmed' => 'appointment_approved',
            'cancelled' => 'appointment_cancelled',
            default => null,
        };
        if ($event) {
            $this->sendForEvent($event, $appointment->patient_phone, $this->appointmentParams($appointment), $appointment->id);
        }
    }

    public function appointmentReminder(Appointment $appointment): void
    {
        $this->sendForEvent('appointment_reminder', $appointment->patient_phone, $this->appointmentParams($appointment), $appointment->id);
    }

    /** Render a template for an event and place the call to a recipient. */
    public function sendForEvent(string $event, ?string $to, array $params, ?int $appointmentId = null): ?VoiceCallLog
    {
        $template = VoiceCallTemplate::activeFor($event);
        if (! $template) {
            return null;
        }
        $params += $this->globalParams();

        return $this->place(
            to: $to,
            event: $event,
            appointmentId: $appointmentId,
            texts: [
                'start' => $this->renderer->render($template->start_text, $params),
                'question' => $this->renderer->render($template->question_text, $params),
                'end' => $this->renderer->render($template->end_text, $params),
                'dtmf1' => $this->renderer->render($template->dtmf1_text, $params),
                'dtmf2' => $this->renderer->render($template->dtmf2_text, $params),
            ],
        );
    }

    /** Direct call used by the admin "Send Test Voice Call". */
    public function sendTest(?string $to, array $params): ?VoiceCallLog
    {
        // Prefer the approved template; fall back to a minimal start text.
        if (VoiceCallTemplate::activeFor('appointment_approved')) {
            return $this->sendForEvent('appointment_approved', $to, $params);
        }

        return $this->place($to, 'test', null, [
            'start' => 'Hello '.($params['patient_name'] ?? '').', this is a test call from '.config('app.name').'.',
            'question' => '', 'end' => '', 'dtmf1' => '', 'dtmf2' => '',
        ]);
    }

    /** Build the log + payload and (inline or queued) deliver it. */
    protected function place(?string $to, string $event, ?int $appointmentId, array $texts): VoiceCallLog
    {
        $settings = VoiceCallSetting::current();
        $requestId = 'req_'.($appointmentId ? 'AP'.$appointmentId.'_' : '').uniqid();

        $payload = [
            'request_id' => $requestId,
            'sender' => $settings->sender_number,
            'phone_numbers' => array_filter([$this->formatPhone($to)]),
            'voice' => $settings->voice_type,
            'language_code' => $settings->language_code,
            'question_texts' => array_values(array_filter([$texts['question']])),
            'start_texts' => array_values(array_filter([$texts['start']])),
            'end_texts' => array_values(array_filter([$texts['end']])),
            'metadata' => ['booking_id' => $appointmentId ? 'AP-'.$appointmentId : 'TEST', 'source' => 'doctorsappointmentbd'],
        ];

        if ($settings->dtmf_enabled) {
            $dtmf = array_values(array_filter([
                $texts['dtmf1'] ? ['key' => '1', 'option_type' => 'voice', 'texts' => [$texts['dtmf1']]] : null,
                $texts['dtmf2'] ? ['key' => '2', 'option_type' => 'voice', 'texts' => [$texts['dtmf2']]] : null,
            ]));
            if ($dtmf) { // omit the key entirely rather than sending an empty array
                $payload['dtmf_options'] = $dtmf;
            }
        }

        $log = VoiceCallLog::create([
            'appointment_id' => $appointmentId,
            'recipient_number' => $to,
            'request_id' => $requestId,
            'event_type' => $event,
            'provider' => 'protiddhoni',
            'payload' => $payload,
            'status' => 'pending',
        ]);

        if (config('voice.queue')) {
            SendVoiceCall::dispatch($log->id);
        } else {
            $this->deliverLog($log->id);
        }

        return $log->refresh();
    }

    /** Deliver a pending log via the provider; records the outcome. Never throws. */
    public function deliverLog(int $logId): void
    {
        $log = VoiceCallLog::find($logId);
        if (! $log || $log->status !== 'pending') {
            return;
        }

        try {
            $settings = VoiceCallSetting::current();

            if (! $settings->enabled) {
                $this->mark($log, 'skipped', error: 'Voice calls disabled');

                return;
            }
            if (! $settings->api_token || ! $settings->sender_number) {
                $this->mark($log, 'skipped', error: 'Voice provider not configured');

                return;
            }
            if (empty($log->payload['phone_numbers'])) {
                $this->mark($log, 'skipped', error: 'Invalid phone number');

                return;
            }

            $result = $this->provider->send($log->payload, $settings);
            $this->mark($log, $result['ok'] ? 'sent' : 'failed', response: $result['response'], error: $result['error']);
        } catch (\Throwable $e) {
            report($e);
            $this->mark($log, 'failed', error: $e->getMessage());
        }
    }

    protected function mark(VoiceCallLog $log, string $status, mixed $response = null, ?string $error = null): void
    {
        $log->update([
            'status' => $status,
            'response' => is_array($response) ? $response : ($response !== null ? ['raw' => $response] : null),
            'error_message' => $error,
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }

    protected function appointmentParams(Appointment $a): array
    {
        $a->loadMissing('doctor:id,full_name', 'hospital:id,name');

        return [
            'patient_name' => $a->patient_name,
            'doctor_name' => $a->doctor?->full_name ?? '',
            'hospital_name' => $a->hospital?->name ?? ($a->doctor?->hospital_name ?? ''),
            'appointment_date' => optional($a->appointment_date)->format('d M Y') ?? (string) $a->appointment_date,
            'appointment_time' => \Illuminate\Support\Str::substr((string) $a->appointment_time, 0, 5),
            'booking_id' => 'AP-'.$a->id,
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
