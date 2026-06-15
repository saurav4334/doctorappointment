<?php

namespace App\Notifications;

/**
 * Outcome of a single channel delivery attempt.
 * Statuses: mock_sent | sent | skipped | failed | pending
 */
class NotificationResult
{
    public function __construct(
        public string $status,
        public ?string $provider = null,
        public ?string $error = null,
    ) {}

    public static function mockSent(?string $provider = 'mock'): self
    {
        return new self('mock_sent', $provider);
    }

    public static function sent(?string $provider = null): self
    {
        return new self('sent', $provider);
    }

    public static function skipped(?string $reason = null): self
    {
        return new self('skipped', null, $reason);
    }

    public static function failed(?string $error = null, ?string $provider = null): self
    {
        return new self('failed', $provider, $error);
    }

    public function delivered(): bool
    {
        return in_array($this->status, ['mock_sent', 'sent'], true);
    }
}
