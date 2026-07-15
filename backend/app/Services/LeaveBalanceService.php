<?php

namespace App\Services;

use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;

class LeaveBalanceService
{
    // Fetches a user's balance row for a given leave type + year, creating it
    // (with carry-forward applied from the prior year) on first access.
    public function getOrCreateBalance(User $user, LeaveType $leaveType, int $year): LeaveBalance
    {
        $balance = LeaveBalance::where('user_id', $user->id)
            ->where('leave_type_id', $leaveType->id)
            ->where('year', $year)
            ->first();

        if ($balance) {
            return $balance;
        }

        return LeaveBalance::create([
            'user_id'         => $user->id,
            'leave_type_id'   => $leaveType->id,
            'year'            => $year,
            'allocated'       => $leaveType->annual_quota ?? 0,
            'carried_forward' => $this->calculateCarryForward($user, $leaveType, $year),
            'used'            => 0,
        ]);
    }

    // Days still available for a leave type in a year, after subtracting
    // both already-used days and days tied up in the user's other pending/
    // in-progress requests (so overlapping unapproved requests can't double-spend).
    public function remainingDays(User $user, LeaveType $leaveType, int $year): int
    {
        $balance = $this->getOrCreateBalance($user, $leaveType, $year);

        $pendingDays = LeaveRequest::where('requester_id', $user->id)
            ->where('leave_type_id', $leaveType->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereYear('start_date', $year)
            ->sum('total_days');

        return $balance->allocated + $balance->carried_forward - $balance->used - $pendingDays;
    }

    // Called when a request reaches final approval — permanently consumes the balance.
    public function deduct(User $user, LeaveType $leaveType, int $year, int $days): void
    {
        $balance = $this->getOrCreateBalance($user, $leaveType, $year);

        $balance->increment('used', $days);
    }

    private function calculateCarryForward(User $user, LeaveType $leaveType, int $year): int
    {
        if (! $leaveType->carry_forward_enabled) {
            return 0;
        }

        $previousYear = LeaveBalance::where('user_id', $user->id)
            ->where('leave_type_id', $leaveType->id)
            ->where('year', $year - 1)
            ->first();

        if (! $previousYear) {
            return 0;
        }

        $unusedFromPreviousYear = $previousYear->allocated + $previousYear->carried_forward - $previousYear->used;

        if ($unusedFromPreviousYear <= 0) {
            return 0;
        }

        return $leaveType->carry_forward_max_days === null
            ? $unusedFromPreviousYear
            : min($unusedFromPreviousYear, $leaveType->carry_forward_max_days);
    }
}
