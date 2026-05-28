<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    // POST /api/leave-requests/{leaveRequest}/approve
    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate([
            'comment' => 'nullable|string|max:1000',
        ]);

        $this->authorize('approve', $leaveRequest);

        $step = $leaveRequest->approvalSteps()
                             ->where('step_number', $leaveRequest->current_step)
                             ->where('status', 'pending')
                             ->firstOrFail();

        $step->update([
            'status'      => 'approved',
            'comment'     => $request->comment,
            'actioned_at' => now(),
        ]);

        if ($leaveRequest->current_step === $leaveRequest->total_steps) {
            // Last step — fully approved
            $leaveRequest->update(['status' => 'approved']);
        } else {
            // Advance to next step
            $leaveRequest->update([
                'status'       => 'in_progress',
                'current_step' => $leaveRequest->current_step + 1,
            ]);
        }

        $leaveRequest->load(['requester', 'approvalSteps.approver']);

        return new LeaveRequestResource($leaveRequest);
    }

    // POST /api/leave-requests/{leaveRequest}/reject
    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate([
            'comment' => 'nullable|string|max:1000',
        ]);

        $this->authorize('approve', $leaveRequest);

        $step = $leaveRequest->approvalSteps()
                             ->where('step_number', $leaveRequest->current_step)
                             ->where('status', 'pending')
                             ->firstOrFail();

        $step->update([
            'status'      => 'rejected',
            'comment'     => $request->comment,
            'actioned_at' => now(),
        ]);

        // Short-circuit — reject the whole request immediately
        $leaveRequest->update(['status' => 'rejected']);

        $leaveRequest->load(['requester', 'approvalSteps.approver']);

        return new LeaveRequestResource($leaveRequest);
    }
}
