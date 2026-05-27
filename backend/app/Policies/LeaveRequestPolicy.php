<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;

class LeaveRequestPolicy
{
    // Can see the list of leave requests?
    public function viewAny(User $user): bool
    {
        return true; // all roles can see a list (filtered in controller by role)
    }

    // Can see a specific leave request?
    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        // Admin sees everything
        if ($user->role === 'admin') return true;

        // Requester can only see their own
        if ($user->role === 'requester') {
            return $leaveRequest->requester_id === $user->id;
        }

        // Approver can see requests assigned to them
        if ($user->role === 'approver') {
            return $leaveRequest->approvalSteps()
                                ->where('approver_id', $user->id)
                                ->exists();
        }

        return false;
    }

    // Can create a leave request?
    public function create(User $user): bool
    {
        return $user->role === 'requester';
    }

    // Can delete a leave request?
    public function delete(User $user, LeaveRequest $leaveRequest): bool
    {
        // Only the requester can delete, and only if still pending
        return $user->id === $leaveRequest->requester_id
            && $leaveRequest->status === 'pending';
    }
}
