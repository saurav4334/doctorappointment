<?php

namespace App\Services\Sms;

use App\Models\SmsSetting;
use Illuminate\Support\Facades\Http;

/**
 * NotifyBD gateway client. Never throws for normal failures — returns a
 * structured result the caller logs.
 *
 * @return array{ok:bool, response:?string, error:?string}
 */
class NotifyBdSmsProvider
{
    public function send(string $to, string $message, SmsSetting $settings): array
    {
        try {
            $response = Http::timeout(20)->acceptJson()->asJson()->post($settings->api_base_url, [
                'api_key' => $settings->api_key,
                'senderid' => $settings->sender_id,
                'type' => $settings->sms_type ?: 'text',
                'scheduledDateTime' => '',
                'msg' => $message,
                'contacts' => $to,
            ]);

            $body = $response->body();

            if (! $response->successful()) {
                return ['ok' => false, 'response' => $body, 'error' => "HTTP {$response->status()}"];
            }

            // NotifyBD returns JSON; treat an explicit error flag as failure when present.
            $json = $response->json();
            if (is_array($json) && isset($json['error']) && $json['error']) {
                return ['ok' => false, 'response' => $body, 'error' => (string) ($json['msg'] ?? 'Provider error')];
            }

            return ['ok' => true, 'response' => $body, 'error' => null];
        } catch (\Throwable $e) {
            return ['ok' => false, 'response' => null, 'error' => $e->getMessage()];
        }
    }
}
