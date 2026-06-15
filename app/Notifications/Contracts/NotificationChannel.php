<?php

namespace App\Notifications\Contracts;

use App\Notifications\NotificationResult;

/**
 * A delivery channel (SMS, email, WhatsApp, voice call). Implementations stay
 * swappable: appointment logic never references a concrete provider, so a real
 * API can be plugged in later by changing only the channel class/driver.
 */
interface NotificationChannel
{
    /** Stable key used in config and logs: sms | email | whatsapp | voice. */
    public function key(): string;

    /** Whether this channel is turned on in config. */
    public function isEnabled(): bool;

    /** Attempt delivery. Must never throw for normal failures — return a result. */
    public function send(string $recipient, string $body, array $context = []): NotificationResult;
}
