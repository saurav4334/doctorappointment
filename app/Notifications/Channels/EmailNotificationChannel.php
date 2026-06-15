<?php

namespace App\Notifications\Channels;

class EmailNotificationChannel extends AbstractChannel
{
    public function key(): string
    {
        return 'email';
    }

    // To send real email later, override deliver() using Laravel Mail:
    // protected function deliver(string $recipient, string $body, array $context): NotificationResult
    // {
    //     Mail::raw($body, fn ($m) => $m->to($recipient)->subject($context['subject'] ?? 'Notification'));
    //     return NotificationResult::sent('smtp');
    // }
}
