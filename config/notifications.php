<?php

return [

    /*
    | Run channel delivery on a queue when true. Defaults to false so it works
    | on cPanel shared hosting WITHOUT a running queue worker (delivered inline).
    | Set to true once you have a worker (or cron `queue:work --once`) configured.
    */
    'queue' => env('NOTIFICATIONS_QUEUE', false),

    /*
    | Channels. `enabled` turns a channel on/off; `driver` selects the provider
    | implementation (currently all "mock" — no external calls are made).
    */
    'channels' => [
        'sms' => ['enabled' => env('NOTIFY_SMS', true), 'driver' => env('NOTIFY_SMS_DRIVER', 'mock')],
        'email' => ['enabled' => env('NOTIFY_EMAIL', true), 'driver' => env('NOTIFY_EMAIL_DRIVER', 'mock')],
        'whatsapp' => ['enabled' => env('NOTIFY_WHATSAPP', false), 'driver' => env('NOTIFY_WHATSAPP_DRIVER', 'mock')],
        'voice' => ['enabled' => env('NOTIFY_VOICE', false), 'driver' => env('NOTIFY_VOICE_DRIVER', 'mock')],
    ],

    /*
    | Which channels fire for each appointment event. Add/remove channel keys
    | here without touching any appointment code.
    */
    'events' => [
        'appointment_requested' => ['sms', 'email'],
        'appointment_approved' => ['sms', 'email'],
        'appointment_rejected' => ['sms', 'email'],
        'appointment_completed' => ['email'],
        'appointment_reminder' => ['sms'],
        'schedule_changed' => ['email'],
    ],

    /*
    | Optional admin recipient for "appointment_requested" alerts.
    */
    'admin' => [
        'phone' => env('NOTIFY_ADMIN_PHONE'),
        'email' => env('NOTIFY_ADMIN_EMAIL'),
    ],

    'clinic_name' => env('APP_NAME', 'Doctors AppointmentBD'),
];
