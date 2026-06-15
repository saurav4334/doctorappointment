<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $bodies = [
            'appointment_requested' => 'Hi {{patient_name}}, your appointment request with {{doctor_name}} on {{date}} at {{time}} has been received. We will confirm shortly. — {{clinic}}',
            'appointment_approved' => 'Hi {{patient_name}}, your appointment with {{doctor_name}} on {{date}} at {{time}} is CONFIRMED. — {{clinic}}',
            'appointment_rejected' => 'Hi {{patient_name}}, we are sorry but your appointment with {{doctor_name}} on {{date}} could not be confirmed. Please rebook. — {{clinic}}',
            'appointment_completed' => 'Hi {{patient_name}}, thank you for visiting {{doctor_name}}. We wish you good health. — {{clinic}}',
            'appointment_reminder' => 'Reminder: your appointment with {{doctor_name}} is on {{date}} at {{time}} at {{hospital}}. — {{clinic}}',
            'schedule_changed' => 'Notice: {{doctor_name}}\'s schedule has changed at {{clinic}}. Please review your booking.',
        ];

        $subjects = [
            'appointment_requested' => 'Appointment request received',
            'appointment_approved' => 'Your appointment is confirmed',
            'appointment_rejected' => 'About your appointment request',
            'appointment_completed' => 'Thank you for your visit',
            'appointment_reminder' => 'Appointment reminder',
            'schedule_changed' => 'Doctor schedule update',
        ];

        $channels = ['sms', 'email', 'whatsapp', 'voice'];

        foreach ($bodies as $event => $body) {
            foreach ($channels as $channel) {
                NotificationTemplate::updateOrCreate(
                    ['event' => $event, 'channel' => $channel],
                    [
                        'subject' => $channel === 'email' ? $subjects[$event] : null,
                        'body' => $body,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
