<?php

namespace App\Notifications\Channels;

class SmsNotificationChannel extends AbstractChannel
{
    public function key(): string
    {
        return 'sms';
    }

    // To integrate a real SMS gateway later, override deliver():
    // protected function deliver(string $recipient, string $body, array $context): NotificationResult
    // {
    //     $response = Http::post($gatewayUrl, [...]);
    //     return $response->successful() ? NotificationResult::sent('your-gateway') : NotificationResult::failed($response->body());
    // }
}
