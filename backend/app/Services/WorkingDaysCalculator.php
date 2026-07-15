<?php

namespace App\Services;

use App\Models\Holiday;
use Carbon\CarbonPeriod;
use Illuminate\Support\Carbon;

class WorkingDaysCalculator
{
    // Counts weekdays between start and end (inclusive), excluding holidays
    public function countBusinessDays(Carbon $start, Carbon $end): int
    {
        $holidayDates = Holiday::whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->pluck('date')
            ->map(fn (Carbon $date) => $date->toDateString())
            ->all();

        $count = 0;

        foreach (CarbonPeriod::create($start, $end) as $date) {
            if ($date->isWeekend()) {
                continue;
            }

            if (in_array($date->toDateString(), $holidayDates, true)) {
                continue;
            }

            $count++;
        }

        return $count;
    }
}
