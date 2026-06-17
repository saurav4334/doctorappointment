<?php

namespace Database\Seeders;

use App\Models\SmsTemplate;
use App\Services\Sms\SmsService;
use Illuminate\Database\Seeder;

class SmsTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $bodies = [
            'appointment_requested' => 'Dear {patient_name}, your appointment request with Dr. {doctor_name} on {appointment_date} at {appointment_time} has been received. Booking ID: {booking_id}. - {site_name}',
            'appointment_approved' => 'Dear {patient_name}, your appointment with Dr. {doctor_name} at {hospital_name} on {appointment_date} at {appointment_time} is CONFIRMED. Booking ID: {booking_id}. - {site_name}',
            'appointment_rejected' => 'Dear {patient_name}, sorry, your appointment with Dr. {doctor_name} on {appointment_date} could not be confirmed. Please rebook or call {support_phone}. - {site_name}',
            'appointment_completed' => 'Dear {patient_name}, thank you for visiting Dr. {doctor_name}. We wish you good health. - {site_name}',
            'appointment_reminder' => 'Reminder: your appointment with Dr. {doctor_name} is on {appointment_date} at {appointment_time}. Booking ID: {booking_id}. - {site_name}',
            'schedule_changed' => 'Notice: Dr. {doctor_name}\'s schedule has changed. Please review your booking. - {site_name}',
            'admin_new_appointment' => 'New appointment request: {patient_name} ({phone}) with Dr. {doctor_name} on {appointment_date} {appointment_time}. ID: {booking_id}.',
            'ambulance_request_received' => 'Ambulance request received from {patient_name} ({phone}). Please respond promptly. - {site_name}',
            'hospital_booking_request' => 'New hospital booking request from {patient_name} ({phone}) for {hospital_name}. - {site_name}',
            'service_request_received' => 'Dear {patient_name}, your request for {service_name} has been received. Our team will contact you at {phone}. - {site_name}',
        ];

        foreach (SmsService::EVENTS as $event => $title) {
            SmsTemplate::updateOrCreate(
                ['event' => $event],
                ['title' => $title, 'body' => $bodies[$event] ?? '{site_name}', 'is_active' => true]
            );
        }
    }
}
