<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveRequestResource;
use App\Models\ApprovalStep;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    // GET /api/leave-requests
    public function index(Request $request)
    {
        $user = $request->user();

        $requests = match ($user->role) {
            'requester' => LeaveRequest::with(['requester', 'approvalSteps.approver'])
                                       ->where('requester_id', $user->id)
                                       ->latest()
                                       ->get(),

            'approver'  => LeaveRequest::with(['requester', 'approvalSteps.approver'])
                                       ->whereHas('approvalSteps', fn ($q) =>
                                           $q->where('approver_id', $user->id)
                                       )
                                       ->latest()
                                       ->get(),

            'admin'     => LeaveRequest::with(['requester', 'approvalSteps.approver'])
                                       ->latest()
                                       ->get(),
        };

        return LeaveRequestResource::collection($requests);
    }

    // POST /api/leave-requests
    public function store(Request $request)
    {
        $this->authorize('create', LeaveRequest::class);

        $validated = $request->validate([
            'leave_type'     => 'required|in:annual,sick,emergency,unpaid',
            'start_date'     => 'required|date|after_or_equal:today',
            'end_date'       => 'required|date|after_or_equal:start_date',
            'reason'         => 'required|string|max:1000',
            'approver_ids'   => 'required|array|min:1|max:5',
            'approver_ids.*' => 'exists:users,id',
        ]);

        $totalSteps = count($validated['approver_ids']);

        $leaveRequest = LeaveRequest::create([
            'requester_id' => $request->user()->id,
            'leave_type'   => $validated['leave_type'],
            'start_date'   => $validated['start_date'],
            'end_date'     => $validated['end_date'],
            'reason'       => $validated['reason'],
            'status'       => 'pending',
            'current_step' => 1,
            'total_steps'  => $totalSteps,
        ]);

        // Pre-create all approval steps upfront
        foreach ($validated['approver_ids'] as $index => $approverId) {
            ApprovalStep::create([
                'leave_request_id' => $leaveRequest->id,
                'approver_id'      => $approverId,
                'step_number'      => $index + 1,
                'status'           => 'pending',
            ]);
        }

        $leaveRequest->load(['requester', 'approvalSteps.approver']);

        return new LeaveRequestResource($leaveRequest);
    }

    // GET /api/leave-requests/{id}
    public function show(Request $request, LeaveRequest $leaveRequest)
    {
        $this->authorize('view', $leaveRequest);

        $leaveRequest->load(['requester', 'approvalSteps.approver']);

        return new LeaveRequestResource($leaveRequest);
    }

    // DELETE /api/leave-requests/{id}
    public function destroy(Request $request, LeaveRequest $leaveRequest)
    {
        $this->authorize('delete', $leaveRequest);

        $leaveRequest->delete();

        return response()->json(['message' => 'Leave request deleted successfully']);
    }
}
