<?php

namespace App\Services\Scheduling;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Derives bookable time slots for a doctor on a given date from their weekly
 * schedules, honouring off-days, per-slot capacity, and past times.
 */
class SlotService
{
    /** Appointment statuses that consume slot capacity. */
    public const ACTIVE_STATUSES = ['pending', 'confirmed'];

    /**
     * @return Collection<int, array{value:string,label:string,available:bool,remaining:int}>
     */
    public function availableSlots(Doctor $doctor, string $date): Collection
    {
        $day = $this->parseDate($date);
        if (! $day) {
            return collect();
        }

        // No bookings in the past or on off-days.
        if ($day->lt(now()->startOfDay())) {
            return collect();
        }
        if ($doctor->offDays()->whereDate('date', $day->toDateString())->exists()) {
            return collect();
        }

        $schedules = $doctor->schedules
            ->where('is_active', true)
            ->where('day_of_week', $day->dayOfWeek); // 0=Sun … 6=Sat

        if ($schedules->isEmpty()) {
            return collect();
        }

        $isToday = $day->isToday();
        $now = now();
        $slots = collect();

        foreach ($schedules as $schedule) {
            $cursor = Carbon::parse($day->toDateString().' '.$schedule->start_time);
            $end = Carbon::parse($day->toDateString().' '.$schedule->end_time);
            $duration = max(5, (int) $schedule->slot_duration);
            $capacity = max(1, (int) $schedule->max_appointments);

            while ($cursor->copy()->addMinutes($duration)->lte($end)) {
                $value = $cursor->format('H:i');

                if (! $slots->has($value)) {
                    $booked = $this->bookedCount($doctor, $day->toDateString(), $value);
                    $remaining = max(0, $capacity - $booked);
                    $inPast = $isToday && $cursor->lte($now);

                    $slots->put($value, [
                        'value' => $value,
                        'label' => $cursor->format('g:i A'),
                        'available' => $remaining > 0 && ! $inPast,
                        'remaining' => $remaining,
                    ]);
                }

                $cursor->addMinutes($duration);
            }
        }

        return $slots->values()->sortBy('value')->values();
    }

    /** Is this exact date+time a currently bookable slot for the doctor? */
    public function isBookable(Doctor $doctor, string $date, string $time): bool
    {
        $time = substr($time, 0, 5);

        return $this->availableSlots($doctor, $date)
            ->firstWhere('value', $time)['available'] ?? false;
    }

    public function bookedCount(Doctor $doctor, string $date, string $time): int
    {
        $time = substr($time, 0, 5);

        return Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $date)
            ->whereIn('appointment_time', [$time, $time.':00'])
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->count();
    }

    /** Capacity configured for the schedule covering this date+time (default 1). */
    public function capacityFor(Doctor $doctor, string $date, string $time): int
    {
        $day = $this->parseDate($date);
        if (! $day) {
            return 0;
        }
        $time = substr($time, 0, 5);

        $capacity = 0;
        foreach ($doctor->schedules->where('is_active', true)->where('day_of_week', $day->dayOfWeek) as $schedule) {
            $start = Carbon::parse($day->toDateString().' '.$schedule->start_time);
            $endLimit = Carbon::parse($day->toDateString().' '.$schedule->end_time);
            $duration = max(5, (int) $schedule->slot_duration);
            for ($c = $start->copy(); $c->copy()->addMinutes($duration)->lte($endLimit); $c->addMinutes($duration)) {
                if ($c->format('H:i') === $time) {
                    $capacity = max($capacity, max(1, (int) $schedule->max_appointments));
                }
            }
        }

        return $capacity;
    }

    protected function parseDate(string $date): ?Carbon
    {
        try {
            return Carbon::parse($date)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }
}
