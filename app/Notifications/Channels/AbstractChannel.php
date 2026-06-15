<?php

namespace App\Notifications\Channels;

use App\Notifications\Contracts\NotificationChannel;
use App\Notifications\NotificationResult;

/**
 * Shared behaviour for all channels. By default it performs a *mock* delivery
 * (no external API call) and returns `mock_sent`. Concrete providers override
 * deliver() once real API credentials/docs are available.
 */
abstract class AbstractChannel implements NotificationChannel
{
    abstract public function key(): string;

    public function isEnabled(): bool
    {
        return (bool) config("notifications.channels.{$this->key()}.enabled", false);
    }

    public function driver(): string
    {
        return (string) config("notifications.channels.{$this->key()}.driver", 'mock');
    }

    public function send(string $recipient, string $body, array $context = []): NotificationResult
    {
        if (trim($recipient) === '') {
            return NotificationResult::skipped('no recipient');
        }
        if (! $this->isEnabled()) {
            return NotificationResult::skipped('channel disabled');
        }

        return $this->deliver($recipient, $body, $context);
    }

    /**
     * Perform the actual delivery. Default = mock (no network).
     * Real providers override this method.
     */
    protected function deliver(string $recipient, string $body, array $context): NotificationResult
    {
        return NotificationResult::mockSent($this->driver());
    }
}
