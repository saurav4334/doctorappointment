<?php

namespace Database\Seeders;

use App\Models\VoiceCallTemplate;
use App\Services\VoiceCall\VoiceCallService;
use Illuminate\Database\Seeder;

class VoiceCallTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'appointment_approved' => [
                'start' => 'হ্যালো {patient_name}, আপনার ডা. {doctor_name} এর সাথে অ্যাপয়েন্টমেন্টটি {appointment_date} তারিখে {appointment_time} সময়ে কনফার্ম করা হয়েছে।',
                'question' => 'আপনার অ্যাপয়েন্টমেন্টটি কনফার্ম হলে এক চাপুন। আমাদের সাথে কথা বলতে দুই চাপুন।',
                'end' => '{site_name} ব্যবহার করার জন্য ধন্যবাদ।',
                'dtmf1' => 'ধন্যবাদ। আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করা হয়েছে।',
                'dtmf2' => 'ধন্যবাদ। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।',
            ],
            'appointment_reminder' => [
                'start' => 'হ্যালো {patient_name}, আপনার ডা. {doctor_name} এর সাথে অ্যাপয়েন্টমেন্টটি {appointment_date} তারিখে {appointment_time} সময়ে রয়েছে।',
                'question' => 'মনে রাখার জন্য এক চাপুন।',
                'end' => '{site_name} ব্যবহার করার জন্য ধন্যবাদ।',
                'dtmf1' => 'ধন্যবাদ।', 'dtmf2' => '',
            ],
            'appointment_cancelled' => [
                'start' => 'হ্যালো {patient_name}, দুঃখিত, আপনার ডা. {doctor_name} এর সাথে অ্যাপয়েন্টমেন্টটি বাতিল করা হয়েছে।',
                'question' => 'নতুন অ্যাপয়েন্টমেন্টের জন্য এক চাপুন।',
                'end' => '{site_name} ব্যবহার করার জন্য ধন্যবাদ।',
                'dtmf1' => 'ধন্যবাদ। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।', 'dtmf2' => '',
            ],
            'ambulance_request_received' => [
                'start' => 'হ্যালো, একটি অ্যাম্বুলেন্স অনুরোধ পাওয়া গেছে।',
                'question' => '', 'end' => '{site_name}', 'dtmf1' => '', 'dtmf2' => '',
            ],
            'service_request_confirmed' => [
                'start' => 'হ্যালো {patient_name}, আপনার হোম সার্ভিস অনুরোধটি নিশ্চিত করা হয়েছে।',
                'question' => '', 'end' => '{site_name} ব্যবহার করার জন্য ধন্যবাদ।', 'dtmf1' => '', 'dtmf2' => '',
            ],
        ];

        foreach (VoiceCallService::EVENTS as $event => $title) {
            $d = $defaults[$event] ?? ['start' => '{site_name}', 'question' => '', 'end' => '', 'dtmf1' => '', 'dtmf2' => ''];
            VoiceCallTemplate::updateOrCreate(
                ['event' => $event],
                [
                    'title' => $title,
                    'start_text' => $d['start'],
                    'question_text' => $d['question'],
                    'end_text' => $d['end'],
                    'dtmf1_text' => $d['dtmf1'],
                    'dtmf2_text' => $d['dtmf2'],
                    'is_active' => true,
                ]
            );
        }
    }
}
