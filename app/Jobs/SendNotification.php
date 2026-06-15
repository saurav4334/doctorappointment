<?php

namespace App\Jobs;

use App\Services\Notifications\AppointmentNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Queue-ready delivery of a single notification log. The service can run this
 * inline (no worker needed) or push it to a queue when notifications.queue=true.
 */
class SendNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $notificationLogId) {}

    public function handle(AppointmentNotificationService $service): void
    {
        $service->deliverLog($this->notificationLogId);
    }
}
