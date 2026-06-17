<?php

namespace App\Jobs;

use App\Services\VoiceCall\VoiceCallService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/** Queue-ready delivery of a single pending voice-call log. */
class SendVoiceCall implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $voiceCallLogId) {}

    public function handle(VoiceCallService $voice): void
    {
        $voice->deliverLog($this->voiceCallLogId);
    }
}
