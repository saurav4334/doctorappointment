<?php

namespace App\Notifications\Channels;

class WhatsAppNotificationChannel extends AbstractChannel
{
    public function key(): string
    {
        return 'whatsapp';
    }

    // To integrate WhatsApp Business / Cloud API later, override deliver() and
    // post the templated message to the provider endpoint.
}
