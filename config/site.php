<?php

return [
    // Support/contact info shown in the top support bar. CMS-editable later.
    'support' => [
        'ambulance_phone' => env('SUPPORT_AMBULANCE_PHONE', '01635600835'),
        'doctor_phone' => env('SUPPORT_DOCTOR_PHONE', '09611 530 530'),
        'email' => env('SUPPORT_EMAIL', 'info@doctorsappointmentbd.com'),
        'hours' => env('SUPPORT_HOURS', '24h x 365 Days'),
    ],

    'social' => [
        'facebook' => env('SOCIAL_FACEBOOK', '#'),
        'linkedin' => env('SOCIAL_LINKEDIN', '#'),
        'youtube' => env('SOCIAL_YOUTUBE', '#'),
        'twitter' => env('SOCIAL_TWITTER', '#'),
        'pinterest' => env('SOCIAL_PINTEREST', '#'),
    ],
];
