<?php

namespace App\Notifications\Channels;

use App\Notifications\NotificationResult;

/**
 * Voice-call notifications (automated phone calls / IVR).
 *
 * This is intentionally a placeholder: when you provide the voice-call API
 * documentation, implement callProvider() and set the driver in config to
 * something other than "mock". No appointment code needs to change.
 */
class VoiceCallNotificationChannel extends AbstractChannel
{
    public function key(): string
    {
        return 'voice';
    }

    protected function deliver(string $recipient, string $body, array $context): NotificationResult
    {
        // A real provider is configured → hand off to the (future) integration.
        if ($this->driver() !== 'mock') {
            return $this->callProvider($recipient, $body, $context);
        }

        // No real provider yet: record a mock call so the flow is testable.
        return NotificationResult::mockSent('mock-voice');
    }

    /**
     * Future integration point. Implement once the voice-call API docs are available, e.g.:
     *
     *   $resp = Http::withToken($apiKey)->post($endpoint, [
     *       'to' => $recipient,
     *       'message' => $body,      // or a TTS/audio URL
     *   ]);
     *   return $resp->successful()
     *       ? NotificationResult::sent($this->driver())
     *       : NotificationResult::failed($resp->body(), $this->driver());
     */
    protected function callProvider(string $recipient, string $body, array $context): NotificationResult
    {
        // Not implemented yet — leave the notification pending for a real worker/integration.
        return new NotificationResult('pending', $this->driver(), 'voice provider not implemented');
    }
}
