<?php

namespace App\Services\VoiceCall;

use App\Models\VoiceCallSetting;
use Illuminate\Support\Facades\Http;

/**
 * Protiddhoni direct-TTS client. Never throws for normal failures — returns a
 * structured result the caller logs. Token is sent as a Bearer header only.
 *
 * @return array{ok:bool, response:mixed, error:?string}
 */
class ProtiddhoniVoiceProvider
{
    public function send(array $payload, VoiceCallSetting $settings): array
    {
        try {
            $response = Http::timeout(20)
                ->retry(1, 500)
                ->withToken($settings->api_token)
                ->acceptJson()
                ->asJson()
                ->post($settings->api_endpoint, $payload);

            $json = $response->json();

            if (! $response->successful()) {
                return ['ok' => false, 'response' => $json ?? $response->body(), 'error' => "HTTP {$response->status()}"];
            }

            if (is_array($json) && isset($json['success']) && $json['success'] === false) {
                return ['ok' => false, 'response' => $json, 'error' => (string) ($json['message'] ?? 'Provider error')];
            }

            return ['ok' => true, 'response' => $json ?? $response->body(), 'error' => null];
        } catch (\Throwable $e) {
            return ['ok' => false, 'response' => null, 'error' => $e->getMessage()];
        }
    }
}
