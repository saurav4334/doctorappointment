<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Services\Notifications\AppointmentNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders {--date= : Target date (default: tomorrow)}';

    protected $description = 'Send reminder notifications for confirmed appointments on the target date.';

    public function handle(AppointmentNotificationService $notifications, \App\Services\Sms\SmsService $sms): int
    {
        $date = $this->option('date')
            ? Carbon::parse($this->option('date'))->toDateString()
            : now()->addDay()->toDateString();

        $appointments = Appointment::with('doctor:id,full_name')
            ->where('status', 'confirmed')
            ->whereDate('appointment_date', $date)
            ->get();

        foreach ($appointments as $appointment) {
            $notifications->appointmentReminder($appointment);
            $sms->appointmentReminder($appointment);
        }

        $this->info("Queued reminders for {$appointments->count()} appointment(s) on {$date}.");

        return self::SUCCESS;
    }
}
